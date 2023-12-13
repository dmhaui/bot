import { join } from 'path';
import axios from 'axios';
import { Prodia } from "prodia.js"
const prodia = new Prodia("3330eeaa-c599-4f29-b788-e560c1f6c08c");
const tempDir = '../../../temp';

const config = {
    name: "geni",
    aliases: ["t2i", "i2i"],
    description: "Tạo hình ảnh",
    usage: "chưa cập nhật nhâ",
    credits: "ĐMVN"
}

const langData = {
    "en_US": {
        "profileImage.noData": "No data...",
        "profileImage.error": "An error occurred",
        "replyMessage": "Vui lòng reply tin nhắn",
        "noAttachment": "Không có tệp đính kèm",
        "noSupportedAttachment": "Không có tệp đính kèm hỗ trợ, chỉ hỗ trợ ảnh và ảnh động",
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
        if (!args.length) return message.reply(`❎ Chưa nhập prompt tạo ảnh.`)
        const input = args.slice(1).join(" ");
        if (args[0]==='t2i') {
          const tag = args[1];
          if (!tag) {
            return message.reply("⚠️ Vui lòng cung cấp prompt cho AI. dùng lệnh: Geni t2i <prompt>");
          }
        
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(input)}`;
        const res = await GET(url);
        const translation = res.data[0].map(item => item[0]).join("");
        const userPrompt = translation
              

        
        let allPaths = [];
        
        const generate = await prodia.generateImage({
            prompt: "(masterpiece, finely detailed ), realistic, natural , textured, 4k  , high-quality," + userPrompt,
            model: "absolutereality_v181.safetensors [3d9d4d2b]",
            negative_prompt: "UnrealisticDream, nsfw, ugly, deformed iris, deformed pupils, worst quality, low quality, ugly, boring, text, signature, logo, watermark, loose artifacts, grainy, blurry, long neck, closed eyes, face jewellery, deformed, noisy, greyscale, 3d render, anime, plastic, bad anatomy, low resolution, extra fingers, blur, wrong proportions, image artifacts, lowres, jpeg artifacts",
            sampler: "DPM++ SDE Karras",
            cfg_scale: 9,
            steps: 50,
            aspect_ratio: "portrait",
            width: 768,
            height: 768
        })
    
        while (generate.status !== "succeeded" && generate.status !== "failed") {
            new Promise((resolve) => setTimeout(resolve, 250));
    
            const job = await prodia.getJob(generate.job);
    
            if (job.status === "succeeded") {
                // console.log(job);
                const imageUrl = job.imageUrl;
                const tempPath = join(global.cachePath, `_prodia${Date.now()}.png`);
                await global.downloadFile(tempPath, imageUrl);
                allPaths.push(tempPath);
                break;
            }
          }
          
        if (allPaths.length == 0) return message.reply(getLang("profileImage.noData"));
        await message.reply({
            attachment: allPaths.map(e => global.reader(e))
        });
        for (const path of allPaths) {
            try {
                global.deleteFile(path);
            } catch (e) {
                console.error(e);
            }
        }
        






        } else if (args[0]==='i2i') {
     
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
          // return message.reply(imageLink);
          
          
            const tag = args[1];
          if (!tag) {
            return message.reply("⚠️ Vui lòng cung cấp prompt cho AI. dùng lệnh: Geni i2i <prompt>");
          }
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(input)}`;
        const res = await GET(url);
        const translation = res.data[0].map(item => item[0]).join("");
        const userPrompt = translation
        
        let allPaths = [];
        
        const generate = await prodia.transformImage({
            imageUrl: imageLink,
            prompt: "(masterpiece, finely detailed ), realistic, natural , textured, 4k  , high-quality," + userPrompt,
            model: "absolutereality_v181.safetensors [3d9d4d2b]",
            negative_prompt: "UnrealisticDream, nsfw, ugly, deformed iris, deformed pupils, worst quality, low quality, ugly, boring, text, signature, logo, watermark, loose artifacts, grainy, blurry, long neck, closed eyes, face jewellery, deformed, noisy, greyscale, 3d render, anime, plastic, bad anatomy, low resolution, extra fingers, blur, wrong proportions, image artifacts, lowres, jpeg artifacts",
            sampler: "DPM++ SDE Karras",
            cfg_scale: 9,
            steps: 50,
            // aspect_ratio: "portrait",
            width: 768,
            height: 768
        })
    
        while (generate.status !== "succeeded" && generate.status !== "failed") {
            new Promise((resolve) => setTimeout(resolve, 250));
    
            const job = await prodia.getJob(generate.job);
    
            if (job.status === "succeeded") {
                // console.log(job);
                const imageUrl = job.imageUrl;
                const tempPath = join(global.cachePath, `_prodia${Date.now()}.png`);
                await global.downloadFile(tempPath, imageUrl);
                allPaths.push(tempPath);
                break;
            }
          }
          
        if (allPaths.length == 0) return message.reply(getLang("profileImage.noData"));
        await message.reply({
            attachment: allPaths.map(e => global.reader(e))
        });
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
        else {
          await message.reply("⚠️ Yêu cầu không hợp lệ! sử dụng -help để được hướng dẫn sử dụng lệnh.");
        }
    }
    catch (error) {
        console.error(error);
        await message.reply("❌ Truy xuất API thất bại");
    }
}


export default {
    config,
    langData,
    onCall
}
