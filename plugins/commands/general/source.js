const config = {
    name: "source",
    aliases: ["code", "about"],
    description: "Show source code of bot"
}

const langData = {
    "en_US": {
        "details": "A Bot Messenger running on NodeJS:\n{source2}"
    },
    "vi_VN": {
        "details": "Bot Messenger chạy trên NodeJS:\n{source2}"
    },
    "ar_SY": {
        "details": "روبوت ماسنجر يعمل على لغة NodeJS:\n{source2}"
    }
}

const source = "https://github.com/XaviaTeam/XaviaBot";
const source2 = "https://github.com/dmhaui";
function onCall({ message, getLang }) {
    message.reply(getLang("details", { source }));
}

export default {
    config,
    langData,
    onCall
}
