const config = {
    name: "uptime",
    aliases: ["upt"],
    credits: "XaviaTeam"
}

// function onCall({ message }) {
//     let uptime = global.msToHMS(process.uptime() * 1000);
//     message.reply(uptime);
// }
function msToHMS(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
  
    const formattedTime = {
      days: days,
      hours: hours % 24,
      minutes: minutes % 60,
      seconds: seconds % 60,
    };
  
    return formattedTime;
  }
  
function onCall({ message }) {
    const uptimeInMs = process.uptime() * 1000;
    const formattedTime = msToHMS(uptimeInMs);

    const replyMessage = `⏱ Bot đã chạy được: ${formattedTime.days} ngày ${formattedTime.hours} giờ ${formattedTime.minutes} phút ${formattedTime.seconds} giây.`;

    message.reply(replyMessage);
}



export default {
    config,
    onCall
}
