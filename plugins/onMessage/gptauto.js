import QuickLRU from 'quick-lru';
import { Configuration, OpenAIApi } from 'openai';
const openaiConfig = new Configuration({ apiKey: global.config.DMBOT })

const api = new OpenAIApi(openaiConfig)
const langData = {
    "en_US": {
        "error": "An error occurred, please try again later"
    },
    "vi_VN": {
        "error": "Có lỗi xảy ra, vui lòng thử lại sau"
    },
    "ar_SY": {
        "error": "لقد حدث خطأ، رجاء أعد المحاولة لاحقا"
    }
}

const onLoad = () => {
    if (!global.hasOwnProperty("gptauto")) global.gptauto = {};
}
// Tạo một cache LRU để lưu trữ lịch sử hội thoại
const conversationHistory2 = new QuickLRU ({ maxSize: 100 });

// Hàm để lấy lịch sử hội thoại cho một threadID cụ thể
function getconversationHistory2(threadID) {
    return conversationHistory2.get(threadID) || [];
}

// Hàm để lưu trữ câu trả lời vào lịch sử hội thoại
function saveToconversationHistory2(threadID, { question, answer }) {
    let threadHistory = conversationHistory2.get(threadID) || [];

    // Giả sử bạn giữ một số lượng hạn chế các tin nhắn trong lịch sử
    const maxHistoryLength = 10;

    // Thêm câu hỏi và câu trả lời mới vào đầu danh sách
    threadHistory.unshift({ question, answer });

    // Kiểm tra xem lịch sử có vượt quá số lượng tối đa không
    if (threadHistory.length > maxHistoryLength) {
        threadHistory = threadHistory.slice(0, maxHistoryLength); // Giữ kích thước tối đa
    }

    // Lưu trữ lịch sử mới vào cache LRU
    conversationHistory2.set(threadID, threadHistory);
}
const _3Sec = 3000;

const onCall = async  ({ message, getLang, data }) => {
    const { senderID, threadID } = message;

    if (senderID == global.botID) return;
    if (!global.gpt.hasOwnProperty(threadID) && !global.gpt[threadID]) return;
    if (message.body.startsWith(`${data?.thread?.data?.prefix || global.config.PREFIX}gpt off`)) return;

    if (!global.gptauto.hasOwnProperty(message.threadID)) global.gptauto[threadID] = {};
    if (!global.gptauto[threadID].hasOwnProperty(senderID)) global.gptauto[threadID][senderID] = 0;

    if (global.gptauto[threadID][senderID] + _3Sec > Date.now()) return;
    global.gptauto[threadID][senderID] = Date.now();

    global
    try {
        const msg = message.body;
    
        // Trước khi gọi GPT API
        const history = getconversationHistory2(message.threadID);
    
        if (history.length > 0 && history[0].answer) {
            // Có lịch sử, sử dụng lịch sử trong cuộc trò chuyện
            const conversationMessages = history.map(entry => ({ role: 'user', content: entry.question }));
            conversationMessages.push({ role: 'assistant', content: history[0].answer });
            conversationMessages.push({ role: 'user', content: msg });
    
            const res = await api.createChatCompletion({
                model: 'gpt-3.5-turbo',
                messages: conversationMessages,
                max_tokens: 2048
            });
    
            // Xử lý câu trả lời và lưu trữ vào lịch sử
            if (res.data && res.data.choices && res.data.choices[0] && res.data.choices[0].message) {
                const success = res.data.choices[0].message.content;
    
                // Lưu trữ câu trả lời vào lịch sử hội thoại
                saveToconversationHistory2(message.threadID, { question: msg, answer: success });
    
                message.reply(success);
            } else {
                console.error("Kết quả từ API không hợp lệ:", res);
                return message.reply(getLang("error"));
            }
        } else {
            // Không có lịch sử hoặc lịch sử rỗng, xử lý theo logic của bạn
            const res = await api.createChatCompletion({
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: msg }],
                max_tokens: 2048
            });
    
            if (res.data && res.data.choices && res.data.choices[0] && res.data.choices[0].message) {
                const success = res.data.choices[0].message.content;
    
                // Lưu trữ câu trả lời vào lịch sử hội thoại
                saveToconversationHistory2(message.threadID, { question: msg, answer: success });
    
                message.reply(success);
            } else {
                console.error("Kết quả từ API không hợp lệ:", res);
                return message.reply(getLang("error"));
            }
        }
    } catch (error) {
        console.error(error);
        return message.reply(getLang("error"));
    }
}

export default {
    onLoad,
    langData,
    onCall
}
