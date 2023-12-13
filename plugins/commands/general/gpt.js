import { Configuration, OpenAIApi } from 'openai';
import ms from 'ms';
import QuickLRU from 'quick-lru';

const openaiConfig = new Configuration({ apiKey: global.config.DMBOT })

const api = new OpenAIApi(openaiConfig)

const config = {
    name: "gpt",
    version: "1.0.0",
    description: "talk with chat GPT",
    usage: "[text]",
    cooldown: 3,
    permissions: [0, 1, 2],
    credits: "ĐMVN",
}


const langData = {
    "en_US": {
        "on": "Chat GPT is now on",
        "off": "Chat GPT is now off",
        "alreadyOn": "Chat GPT is already on",
        "alreadyOff": "Chat GPT is already off",
        "missingInput": "Please enter the content you want to chat with Chat GPT",
        "noResult": "Chat GPT doesn't understand what you're saying :(",
        "error": "An error occurred, please try again later"
    },
    "vi_VN": {
        "on": "Chat GPT đã được bật",
        "off": "Chat GPT đã được tắt",
        "alreadyOn": "Chat GPT đã được bật",
        "alreadyOff": "Chat GPT đã được tắt",
        "missingInput": "Vui lòng nhập nội dung cần trò chuyện với Chat GPT",
        "noResult": "Chat GPT không hiểu bạn đang nói gì :(",
        "error": "Có lỗi xảy ra, vui lòng thử lại sau"
    },
    "ar_SY": {
        "on": "Chat GPT is now on",
        "off": "Chat GPT is now off",
        "alreadyOn": "Chat GPT is already on",
        "alreadyOff": "Chat GPT is already off",
        "missingInput": "الرجاء إدخال المحتوى الذي تريد الدردشة مع نينو",
        "noResult": "نينو لا تفهم ما تقول :(",
        "error": "لقد حدث خطأ، رجاء أعد المحاولة لاحقا"
    }
}

function onLoad() {
    if (!global.hasOwnProperty("gpt")) global.gpt = {};
}

// Tạo một cache LRU để lưu trữ lịch sử hội thoại
const conversationHistory = new QuickLRU ({ maxSize: 50 });

// Hàm để lấy lịch sử hội thoại cho một threadID cụ thể
function getConversationHistory(threadID) {
    return conversationHistory.get(threadID) || [];
}

// Hàm để lưu trữ câu trả lời vào lịch sử hội thoại
function saveToConversationHistory(threadID, { question, answer }) {
    let threadHistory = conversationHistory.get(threadID) || [];

    // Giả sử bạn giữ một số lượng hạn chế các tin nhắn trong lịch sử
    const maxHistoryLength = 10;

    // Thêm câu hỏi và câu trả lời mới vào đầu danh sách
    threadHistory.unshift({ question, answer });

    // Kiểm tra xem lịch sử có vượt quá số lượng tối đa không
    if (threadHistory.length > maxHistoryLength) {
        threadHistory = threadHistory.slice(0, maxHistoryLength); // Giữ kích thước tối đa
    }

    // Lưu trữ lịch sử mới vào cache LRU
    conversationHistory.set(threadID, threadHistory);
}


async function onCall({ message, args, getLang, userPermissions }) {
    const input = args.join(" ");
    if (!input) return message.reply(getLang("missingInput"));

    if (input == "on" || input == "off")
        if (!userPermissions.includes(1)) return;

    if (input == "off") {
        if (!global.gpt.hasOwnProperty(message.threadID)) return message.reply(getLang("alreadyOff"));
        delete global.gpt[message.threadID];

        return message.reply(getLang("off"));
    } else if (input == "on") {
        if (global.gpt.hasOwnProperty(message.threadID)) return message.reply(getLang("alreadyOn"));
        global.gpt[message.threadID] = true;

        return message.reply(getLang("on"));
    }
    if (global.gpt.hasOwnProperty(message.threadID)) return;



    

    
    global
    try {
        const msg = args.join(' ');
    
        // Trước khi gọi GPT API
        const history = getConversationHistory(message.threadID);
    
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
                saveToConversationHistory(message.threadID, { question: msg, answer: success });
    
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
                saveToConversationHistory(message.threadID, { question: msg, answer: success });
    
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
    config,
    onLoad,
    langData,
    onCall
}
