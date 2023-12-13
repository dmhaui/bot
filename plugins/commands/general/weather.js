import WeatherJS from 'weather-js';

const config = {
    name: "weather",
    description: "Get weather info",
    usage: "[location]",
    cooldown: 3,
    permissions: [0, 1, 2],
    credits: "ĐMVN"
}

const langData = {
    "vi_VN": {
        "missingInput": "Vui lòng nhập địa điểm",
        "notFound": "Không tìm thấy địa điểm",
        "results": "Thời tiết tại\n{name}:\n\nNhiệt độ: {temperture}°C\nLúc: {day}\nTrạng thái: {skytext}\nCảm giác: {feelslike}\nĐộ ẩm: {humidity}\nTốc độ gió: {windspeed}\n\nDự báo 5 ngày tiếp:\nday 1: {thu2}\nday 2: {thu3}\nday 3: {thu4}\nday 4: {thu5}\nday 5: {thu6}\n",
        "error": "Đã xảy ra lỗi"
    },
    "en_US": {
        "missingInput": "Please enter a location",
        "notFound": "Location not found",
        "results": "Weather at {name}:\nTemperature: {temperture}°C\nTime: {day}, {date}\nObservation time: {observationtime}\nObservation point: {observationpoint}\nSky status: {skytext}\nWind speed: {windspeed}\nHumidity: {humidity}",
        "error": "An error has occurred"
    },
    "ar_SY": {
        "missingInput": "الرجاء إدخال موقع",
        "notFound": "الموقع غير موجود",
        "results": "الطقس في {name}:\nدرجة الحرارة: {temperture}°C\الوقت: {day}, {date}\وقت المراقبة: {observationtime}\nنقطة المراقبة: {observationpoint}\nحالة السماء: {skytext}\nسرعة الريح: {windspeed}\nالرطوبة: {humidity}",
        "error": "حدث خطأ"
    }
}

async function onCall({ message, args, getLang }) {
    try {
        const input = args[0]?.toLowerCase();
        if (input?.length == 0) return message.reply(getLang("missingInput"));

        const location = args.join(" ");
        WeatherJS.find(
            {
              search: location,
              degreeType: "C",
            },
            (err, result) => {
              if (err) {
                // return message.thread.send(`Có lỗi trong quá trình lấy dữ liệu thời tiết.`)
                message.reply(getLang("error"));
              }
              if (result.length === 0) {
                // return message.thread.send(`Không có kết quả cho "${location}". Vui lòng điền tên địa chỉ hợp lệ.`)
                return message.reply(`Không có kết quả cho "${location}". Vui lòng điền tên địa chỉ hợp lệ.`);
              }

              // Get time
              const currentTimeInVietnam = getCurrentTimeInVietnam();
              const formattedDateTime = formatDateTime(currentTimeInVietnam);
            //   console.log(formattedDateTime);

              const weatherData = result[0];
              
            //   return message.thread.send(thoitiet)
            return message.reply(getLang("results", {
                name: weatherData.location.name,
                temperture: weatherData.current.temperature,
                day: formattedDateTime,
                skytext: weatherData.current.skytext,
                feelslike: weatherData.current.feelslike,
                windspeed: weatherData.current.winddisplay,
                humidity: weatherData.current.humidity,
                thu2: weatherData.forecast[0].skytextday,
                thu3: weatherData.forecast[1].skytextday,
                thu4: weatherData.forecast[2].skytextday,
                thu5: weatherData.forecast[3].skytextday,
                thu6: weatherData.forecast[4].skytextday
            }))
            }
          );

    } catch (e) {
        console.error(e);
        message.reply(getLang("error"));
    }
}

function getCurrentTimeInVietnam() {
    // Lấy thời gian hiện tại (UTC)
    const currentTimeUTC = new Date();

    // UTC offset của Việt Nam là UTC+7
    const utcOffsetInHours = 0;

    // Tính thời gian hiện tại ở Việt Nam bằng cách cộng thêm UTC offset
    const currentTimeInVietnam = new Date(currentTimeUTC.getTime() + utcOffsetInHours * 60 * 60 * 1000);

    return currentTimeInVietnam;
}
  
function formatDateTime(dateTime) {
    const options = {
    hour: 'numeric',
    minute: 'numeric',
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    timeZone: 'Asia/Ho_Chi_Minh', // Chọn múi giờ của Việt Nam
    };

    const formatter = new Intl.DateTimeFormat('vi-VN', options);
    return formatter.format(dateTime);
}

export default {
    config,
    langData,
    onCall
}
