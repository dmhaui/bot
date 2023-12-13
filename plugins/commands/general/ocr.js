import { join } from 'path';
import axios from 'axios';
import Tesseract from 'tesseract.js';
import { Prodia } from "prodia.js";
const prodia = new Prodia("3330eeaa-c599-4f29-b788-e560c1f6c08c");
const tempDir = '../../../temp';

const config = {
    name: "ocr",
    aliases: ["vie", "eng"],
    description: "Chuyển ảnh thành chữ",
    usage: "chưa cập nhật nhâ",
    credits: "ĐMVN"
}

const langData = {
    "en_US": {
        "profileImage.noData": "No data...",
        "profileImage.error": "An error occurred",
        "replyMessage": "Vui lòng reply tin nhắn",
        "noAttachment": "Không có tệp đính kèm",
        "noSupportedAttachment": "Không có tệp đính kèm hỗ trợ, chỉ hỗ trợ ảnh",
        "uploadFailed": "Lấy link thất bại",
        "error": "Đã xảy ra lỗi"
    },
    "vi_VN": {
        "profileImage.noData": "Không có dữ liệu...",
        "profileImage.error": "Đã xảy ra lỗi"
    },
    "ar_SY": {
        "profileImage.noData": "لايوجد بيانات...",
        "profileImage.error": "حدث خطأ"
    }
}
const supportedType = ["photo", "animated_image"];

function upload(url) {
    return new Promise(resolve => {
        global.request(`${global.xva_api.main}/imgbb`, {
            method: "POST",
            data: {
                url: url
            }
        }, async (error, res, data) => {
            if (error) {
                console.error(error);
                return resolve(null);
            }

            return resolve(data.url);
        })
    })
}
async function onCall({ message, args, getLang }) {
    try {

        if (args[0]==='vie' || args[0]==='vi' ) {
     
            try {
            const { type, messageReply } = message;
              
            if (type != "message_reply") return message.reply(getLang("replyMessage"));
    
            let { attachments } = messageReply;
    
            if (!attachments || !attachments.length) return message.reply(getLang("noAttachment"));
            let filteredAttachments = attachments.filter(attachment => supportedType.includes(attachment.type));
    
            if (!filteredAttachments.length) return message.reply(getLang("noSupportedAttachment"));
    
            let urls = [];
            for (let attachment of filteredAttachments) {
                let url = await upload(attachment.url);
                if (!url) continue;
                urls.push(url);
            }
    
            if (!urls.length) return message.reply(getLang("uploadFailed"));
    
            let imageLink = urls.join("\n");

            
            let allPaths = [];
            

            const imageUrl = imageLink;
            const tempPath = join(global.cachePath, `_prodia${Date.now()}.png`);
            await global.downloadFile(tempPath, imageUrl);
            allPaths.push(tempPath);
            
                
            if (allPaths.length == 0) return message.reply(getLang("profileImage.noData"));

            const text = Tesseract.recognize(tempPath, 'vie');


            await message.reply(text);
            for (const path of allPaths) {
                try {
                    global.deleteFile(path);
                } catch (e) {
                    console.error(e);
                }
            }
                } catch (err) {
                console.log(err)
                message.reply('Lấy URL tải ảnh thất bại');
                }
                
        } else if (args[0]==='eng' || args[0]==='en') {
    
            try {
            const { type, messageReply } = message;
                
            if (type != "message_reply") return message.reply(getLang("replyMessage"));
    
            let { attachments } = messageReply;
    
            if (!attachments || !attachments.length) return message.reply(getLang("noAttachment"));
            let filteredAttachments = attachments.filter(attachment => supportedType.includes(attachment.type));
    
            if (!filteredAttachments.length) return message.reply(getLang("noSupportedAttachment"));
    
            let urls = [];
            for (let attachment of filteredAttachments) {
                let url = await upload(attachment.url);
                if (!url) continue;
                urls.push(url);
            }
    
            if (!urls.length) return message.reply(getLang("uploadFailed"));
    
            let imageLink = urls.join("\n");

            
            let allPaths = [];
            

            const imageUrl = imageLink;
            const tempPath = join(global.cachePath, `_prodia${Date.now()}.png`);
            await global.downloadFile(tempPath, imageUrl);
            allPaths.push(tempPath);
            
                
            if (allPaths.length == 0) return message.reply(getLang("profileImage.noData"));

            const text = Tesseract.recognize(tempPath, 'eng');


            await message.reply(text);
            for (const path of allPaths) {
                try {
                    global.deleteFile(path);
                } catch (e) {
                    console.error(e);
                }
            }
                } catch (err) {
                console.log(err)
                message.reply('Lấy URL tải ảnh thất bại');
                }
                
            }
    }
    catch (error) {
        console.error(error);
        await message.reply("❌ Chuyển ảnh thành chữ thất bại");
    }
}


export default {
    config,
    langData,
    onCall
}
