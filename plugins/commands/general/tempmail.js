import axios from 'axios';
const config = {
    name: "tempmail",
    description: "Tạo ra một email tạm thời",
    usage: "Cách dùng:\n\n" +
    "Tempmail -gen [tag]: Tạo một địa chỉ email một lần với tag được cung cấp.\n" +
    "Tempmail -check: Truy xuất các email nhận được trong 2 giờ qua từ TestMail API.\n\n" +
    "Tempmail -checklast: Kiểm tra email cuối cùng nhận được, email mới nhất.\n\n" +
    "ví dụ:\n" +
    "Tempmail -gen Minh\n" +
    "Tempmail -check\n\n" +
    "Tempmail -checklast\n\n" +
    "Lưu ý: Tag có thể là bất cứ kí tự hợp lệ nào để tạo email",
    cooldown: 3,
    permissions: [0, 1, 2],
    credits: "ĐMVN"
}

const langData = {
    "en_US": {
      
    },
    "vi_VN": {
     
    },
    "ar_SY": {
      
    }
}

async function onCall({ message, args, getLang, data }) {
    try {
        if (!args.length) return message.reply(`❎ Chưa nhập thông tin cho temp mail.`)
        const input = args.join(" ");
        
        
        if (input.includes("gen")) {
          const tag = args[1];
          if (!tag) {
            return message.reply("⚠️ Vui lòng cung cấp 1 cái tên (tag) cho địa chỉ email. dùng lệnh: Tempmail -gen [tag]");
          }
          const email = `d8h98.${tag}@inbox.testmail.app`;
          // await api.sendMessage(`📧 Email tạm thời của bạn là: ${email}`, event.threadID);
          await message.reply(`📧 Email tạm thời của bạn là: ${email}`);
        } else if (input.includes("check")) {
          const APIKEY = "e2298007-6128-46be-a787-088262816000";
          const NAMESPACE = "d8h98";
          const apiUrl = `https://api.testmail.app/api/json?apikey=${APIKEY}&namespace=${NAMESPACE}&pretty=true`;
      
          try {
            const response = await axios.get(apiUrl);
            const emails = response.data.emails.filter((email) => Date.now() - email.timestamp <= 2 * 60 * 60 * 1000);
            const count = emails.length;
            let mgs = `✉️ Bạn có ${count} emails:\n\n`;
      
            emails.forEach((email) => {
              const subject = email.subject;
              const from = email.from;
              const date = new Date(email.timestamp).toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" });
              const text = email.text || email.html;
              const to = email.to;
              const id = email.id;
              const downloadUrl = email.downloadUrl;
              const attachments = email.attachments;
              let attachmentMsg = "";
      
              if (attachments.length > 0) {
                attachmentMsg += "\n📎 Attachment:";
                attachments.forEach((attachment) => {
                  attachmentMsg += `\n📁 Filename: ${attachment.filename}\n📂 Type: ${attachment.contentType}\n🗂️ Filesize: ${attachment.size}\n⬇️ Download Url: ${attachment.downloadUrl}`;
                });
              }
      
              mgs += `📬 From: ${from}\n✉️ To: ${to}\n📅 Date: ${date}\n📧 Subject: ${subject}\n📜 Message:\n\n${text}${attachmentMsg}\n\n`;
            });
            
            mgs = mgs.trim();
            await message.reply(mgs);
          } catch (error) {
            console.error(error);
            await message.reply("❌ Truy xuất Email thất bại");
            // api.sendMessage("❌ Truy xuất Email thất bại", event.threadID);
                  
          }
        } 
        else if (input.includes("last")){
          const APIKEY = "e2298007-6128-46be-a787-088262816000";
          const NAMESPACE = "d8h98";
          const apiUrl = `https://api.testmail.app/api/json?apikey=${APIKEY}&namespace=${NAMESPACE}&pretty=true`;

          try {
              const response = await axios.get(apiUrl);
              const emails = response.data.emails.filter((email) => Date.now() - email.timestamp <= 2 * 60 * 60 * 1000);

              if (emails.length > 0) {
                  const latestEmail = emails[0];
                  const subject = latestEmail.subject;
                  const from = latestEmail.from;
                  const date = new Date(latestEmail.timestamp).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
                  const text = latestEmail.text || latestEmail.html;
                  const to = latestEmail.to;
                  const id = latestEmail.id;
                  const downloadUrl = latestEmail.downloadUrl;
                  const attachments = latestEmail.attachments;
                  let attachmentMsg = "";

                  if (attachments.length > 0) {
                      attachmentMsg += "\n📎 Attachment:";
                      attachments.forEach((attachment) => {
                          attachmentMsg += `\n📁 Filename: ${attachment.filename}\n📂 Type: ${attachment.contentType}\n🗂️ Filesize: ${attachment.size}\n⬇️ Download Url: ${attachment.downloadUrl}`;
                      });
                  }

                  const emailInfo = `📬 From: ${from}\n✉️ To: ${to}\n📅 Date: ${date}\n📧 Subject: ${subject}\n\n📜 Message:\n\n${text}${attachmentMsg}\n\n`;

                  await message.reply(emailInfo);
              } else {
                  await message.reply("📬 Không có email nào trong hộp thư tạm thời của bạn.");
              }
          } catch (error) {
              console.error(error);
              await message.reply("❌ Truy xuất Email thất bại");
          }

        }
        else {
          await message.reply("⚠️ Yêu cầu không hợp lệ! sử dụng -help để được hướng dẫn sử dụng lệnh.");
          // api.sendMessage("⚠️ Yêu cầu không hợp lệ! sử dụng -help để được hướng dẫn sử dụng lệnh.", event.threadID);
        }

    }
    catch (error) {
        console.error(error);
        await message.reply("❌ Truy xuất Email thất bại");
    }
}

export default {
    config,
    langData,
    onCall
}
