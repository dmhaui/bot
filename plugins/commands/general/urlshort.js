import axios from 'axios';
const config = {
    name: "urlshort",
    description: "Rút ngắn url",
    usage: "urlshort [link]",
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
        if (!args.length) return message.reply(`❎ Chưa có link.`)

        var text = args.join(" ")
        const encodedParams = new URLSearchParams();
        encodedParams.append("url", text);
        const options = {
          method: "POST",
          url: "https://url-shortener-service.p.rapidapi.com/shorten",
          headers: {
            "content-type": "application/x-www-form-urlencoded",
            "X-RapidAPI-Host": "url-shortener-service.p.rapidapi.com",
            "X-RapidAPI-Key": "04357fb2e1msh4dbe5919dc38cccp172823jsna0869f87acc3",
          },
          data: encodedParams,
        };
        try {
          const response = await axios.request(options);
          // console.log(response.data.result_url);
          message.reply("Shortened Url: " + response.data.result_url);
        } catch (error) {
          console.error(error);
          await message.reply("❌ Rút gọn link thất bại");  
        }
    
    } catch (error) {
      console.error(error);
      await message.reply("❌ Rút gọn link thất bại");            
    }

}

export default {
    config,
    langData,
    onCall
}
