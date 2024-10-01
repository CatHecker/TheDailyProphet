const TelegramApi = require('node-telegram-bot-api')
require('dotenv').config();
// token apply 
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
let helloWorld = {
	"hello": 1,
	"world": 0
}
app.get('/', (req, res) => {
	res.send(helloWorld);
});
app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});
const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramApi(token, {
	polling: true
})

bot.setMyCommands([{
		command: '/start',
		description: 'Для чего нужен бот'
	},
	{
		command: '/change',
		description: 'Сбросить значение группы'
	}
]).catch((err) => {
	console.error('Ошибка при установке команд:', err);
});

let checkCommands = function (msg, group) {
	let text = msg.text;
	let chatId = msg.chat.id;
	let course = 4 - Number(group[3])
	if (text != null && text != undefined && text != '') {
		if (text[0] == '/') {
			text = text.slice(1)
		}
	}
	if (text === 'start' || text == '/start' || text == '/start@DailyProphetKpfuBot' || text == 'start@DailyProphetKpfuBot') {
		const startMessage = `
<strong>🌟 Добро пожаловать, студент! 🌟</strong>

📅 Здесь ты можешь найти расписание своей группы 

🔍 Чтобы начать введи номер группы (например: 09-101)
		`
		bot.sendMessage(chatId, startMessage, {
			parse_mode: 'HTML'
		})
		return
	}

	if (text === 'change' || text === "/change" || text == '/change@DailyProphetKpfuBot' || text == 'change@DailyProphetKpfuBot') {
		if (group == '') {
			bot.sendMessage(chatId, `❌ Для выполнения этой команды нужно сначала ввести группу! ❌`)
		} else {
			for (let i = 0; i < whoNeedSchedule.length; i++) {
				if (whoNeedSchedule[i].chat_id == chatId) {
					whoNeedSchedule.splice(i, 1)
					break
				}
			}
			group = ''

			const sql1 = "DELETE FROM dailyProphet WHERE chat_id = ?";
			const groupValues1 = [chatId];

			try {
				pool.getConnection(function (err, connection) {
					if (err) {
						console.error("Ошибка подключения SQL(для удаления строки): " + err.message);
						return;
					} else {
						connection.execute(sql1, groupValues1, (err, res) => {
							connection.release()
							if (err) {
								console.error("Ошибка удаления строчки SQL: " + err.message);
								bot.sendMessage(chatId, `⛔ Произошла ошибка! Попробуйте ещё раз`)
								return;
							}
						});
						bot.sendMessage(chatId, `✅ Значение группы сброшено, введите новый номер группы`, {
							reply_markup: {
								remove_keyboard: true
							}
						});
					}
				})

				//Удалить в случае ошибок
				//
				// pool.getConnection(function (err, connection) {
				// 	if (err) {
				// 		console.error("Ошибка подключения SQL(для проверки запросов): " + err.message);
				// 		return;
				// 	} else {
				// 		connection.execute('SHOW STATUS WHERE variable_name = Threads_connected', (err, res) => {
				// 			connection.release()
				// 			if (err) {
				// 				console.error("Ошибка удаления строчки SQL: " + err.message);
				// 				return;
				// 			} else {
				// 				console.log(res)
				// 			}
				// 		});
				// 	}
				// })




			} catch (err) {
				console.error('Ошибка при удалении группы:', err);
			}
			return;
		}
	}
	let linkDestroyer = (lections, googleString, groupIndex) => {
		let platforms = [1, 1, 1, 1, 1, 1, 1]
		lections += `⏰ ${googleString[1]}-${googleString[2]}\n\n`
		let strCell = googleString[groupIndex]
		googleString[groupIndex] = googleString[groupIndex].split('\n')
		for (googleCell of googleString[groupIndex]) {
			let link = googleCell
			let textOfLink = ''
			if (googleCell.includes('https://')) {
				if (googleCell.includes('telemost')) {
					textOfLink = `Телемост - ${platforms[0]++}`
				} else if (googleCell.includes('mts-link')) {
					textOfLink = `МТС-Линк - ${platforms[1]++}`
				} else if (googleCell.includes('yandex.ru/chat')) {
					textOfLink = `Яндекс Чат - ${platforms[2]++}`
				} else if (googleCell.includes('yandex.ru/event')) {
					textOfLink = `Яндекс Календарь - ${platforms[3]++}`
				} else if (googleCell.includes('discord')) {
					textOfLink = `Discord - ${platforms[4]++}`
				} else if (googleCell.includes('zoom')) {
					textOfLink = `Zoom - ${platforms[5]++}`
				} else {
					textOfLink = `Материалы - ${platforms[6]++}`
				}
				googleCell = `<a href= '${link}' > ${textOfLink} </a>\n`
			}
			if (googleCell == '') {
				lections += '\n\n'
			}

			lections += googleCell
		}

		lections = lections.replace(/Ссылка на консультацию:/gi, '')
		lections = lections.replace(/Ссылка на консультацию: /gi, '')
		lections = lections.replace(/Ссылка на видеовстресу для организатора и участников:/gi, '')
		lections = lections.replace(/Ссылка на трансляцию для зрителей:/gi, '')

		googleString[groupIndex] = strCell
		return lections
	}
	//schedule for today
	if ((text == 'На сегодня' || text == 'На завтра' || text == 'Расписание на сегодня') && group !== '') {
		let groupIndex = listsOfData[course][0].indexOf(group)
		let time1 = new Date()
		let offset1 = time1.getTimezoneOffset() + 180
		let time2 = new Date(new Date() - 0 + offset1 * 60 * 1000 + 1000 * 60 * 10)
		let day = time2.getDay();
		if (text.includes('завтра')) {
			day++
		}
		let lectionsForToday = `Расписание на сегодня: \n\n`
		listsOfData[course].map(googleString => {
			if (day == googleString[0] && googleString[groupIndex] != null && googleString[groupIndex].includes('Описание пары:')) {
				lectionsForToday = linkDestroyer(lectionsForToday, googleString, groupIndex)
			}
		})
		if (lectionsForToday == `Расписание на сегодня: \n\n`) {
			if (text.includes('завтра')) {
				lectionsForToday = '🥳 Завтра пар нет'
			} else {
				lectionsForToday = '🥳 Сегодня пар нет'
			}
		}
		bot.sendMessage(chatId, lectionsForToday, {
			parse_mode: 'HTML',
			disable_web_page_preview: true
		})
	}
	// schedule for week
	let weekDayNames = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье"]
	if (weekDayNames.includes(text)) {
		lectionsFDW = `<b>${text}:</b>\n\n`
		let groupIndex = listsOfData[course][0].indexOf(group)
		let day = weekDayNames.indexOf(text) + 1
		listsOfData[course].map(googleString => {
			if (day == googleString[0] && googleString[groupIndex] != null && googleString[groupIndex].includes('Описание пары:')) {
				lectionsFDW = linkDestroyer(lectionsFDW, googleString, groupIndex)
			}
		})
		if (lectionsFDW == `<b>${text}:</b>\n\n`) {
			lectionsFDW = 'В этот день пар нет 🥳'
		}
		bot.sendMessage(chatId, lectionsFDW, {
			parse_mode: 'HTML',
			disable_web_page_preview: true
		})
	}
	if ((text == 'Расписание на неделю' || text == 'На неделю') && group !== '') {

		let tempWeekDay = 1
		let groupIndex = listsOfData[course][0].indexOf(group)
		let lectionsForWeek = `
<b>Расписание на неделю:

Понедельник</b>

`
		listsOfData[course].map(googleString => {
			let nowWeekDay = googleString[0];
			if (googleString[groupIndex] != null && googleString[groupIndex].includes('Описание пары:')) {
				if (nowWeekDay != tempWeekDay) {
					lectionsForWeek += `\n<b>${weekDayNames[nowWeekDay-1]}</b>\n\n`
					tempWeekDay = nowWeekDay
				}
				lectionsForWeek = linkDestroyer(lectionsForWeek, googleString, groupIndex)
			}
		})
		bot.sendMessage(chatId, lectionsForWeek, {
			parse_mode: 'HTML',
			disable_web_page_preview: true
		})
	}
	// Информация
	let noti = '⛔️'
	let inlineBut = 'Включить'
	if (text == 'Инфо' && group != '') {
		for (let id of whoNeedSchedule) {
			if (id.chat_id == chatId) {
				if (id.notifications) {
					noti = '✅'
					inlineBut = 'Отключить'
				}
			}
		}
		bot.sendMessage(chatId, `
👥 Вы выбрали группу: ${group}

🔔 Уведомления о консультациях: ${noti}

✉️ По всем вопросам и предложениям - обращайтесь к нам!

🧑‍💻 Разработчики: <a href='t.me/chud0kot'>ChudoKOT</a>, <a href='t.me/iWanderling'>Никита Слывка</a>

💸 <a href='https://www.tinkoff.ru/rm/akhiyarov.emil1/jomzE2512'>Поддержать бота</a> 
`, {
			parse_mode: 'HTML',
			disable_web_page_preview: true,
			reply_markup: {
				inline_keyboard: [
					[{
						text: `${inlineBut} уведомления`,
						callback_data: `1`
					}]
				]
			}
		})
	}
}
/* Функция подключения google sheets */
const {
	google
} = require("googleapis");

function NodeGoogleSheets(keyMass, fun) {
	const auth = new google.auth.GoogleAuth({
		//keyFile: "./google_file.json",
		credentials: {
			type: "service_account",
			project_id: process.env.GOOGLE_PROJECT_ID,
			private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID, //private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID
			private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
			client_email: process.env.GOOGLE_CLIENT_EMAIL,
			client_id: process.env.GOOGLE_CLIENT_ID,
			auth_uri: "https://accounts.google.com/o/oauth2/auth",
			token_uri: "https://oauth2.googleapis.com/token",
			auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
			client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/" + process.env.GOOGLE_CLIENT_EMAIL,
		},

		scopes: "https://www.googleapis.com/auth/spreadsheets",
	});
	(async () => {
		const client = await auth.getClient();

		const googleSheets = google.sheets({
			version: "v4",
			auth: client
		});

		const spreadsheetId = process.env.GOOGLE_SHEET_ID;

		const metaData = await googleSheets.spreadsheets.get({
			auth,
			spreadsheetId,
		});

		const data = {
			auth,
			spreadsheetId,
			valueInputOption: "USER_ENTERED",
			resource: {
				values: keyMass.change,
			},
		}

		if (keyMass.append) {
			data['range'] = keyMass.append;

			const append = await googleSheets.spreadsheets.values.append(data);

			fun(append);
		} else if (keyMass.values) {
			data['range'] = keyMass.values;

			delete data.valueInputOption;
			delete data.resource;

			const values = await googleSheets.spreadsheets.values.get(data);

			fun(values);
		} else if (keyMass.update) {
			data['range'] = keyMass.update;

			const update = await googleSheets.spreadsheets.values.update(data);

			fun(update);
		}
	})();
}

// google sheets fn
let whoNeedSchedule = []
let listsOfData = [
	[''],
	[''],
	[''],
	['']
]
let firstUpdateGoogle = 1
let counterOfConnection = 0
let googleSheetsUpdate = function () {
	for (let i = 1; i < 5; i++) {
		NodeGoogleSheets({
			values: `Курс ${i}`
		}, (data) => {
			let listOfData = data.data.values;
			if (firstUpdateGoogle) {
				counterOfConnection++
			}
			if (counterOfConnection == 4) {
				firstUpdateGoogle = 0
				counterOfConnection = 0
				console.log('Google sheets подключены')
				sqlConnect()
			}
			listsOfData[i - 1] = listOfData
		})
	}
}
bot.on('callback_query', query => {
	whoNeedSchedule.map(el => {
		if (el.chat_id == query.message.chat.id) {
			el.notifications = !el.notifications
			pool.getConnection(function (err, connection) {
				if (err) {
					console.error("Ошибка подключения SQL(для обновления уведомлений): " + err.message);
					return;
				}
				connection.execute("UPDATE dailyProphet SET notifications = ? WHERE chat_id = ?", [el.notifications, el.chat_id], function (err, res) {
					connection.release()
					if (err) {
						console.error('Ошибка при обновлении уведомлений SQL:' + err.message)
						bot.sendMessage(chatId, `⛔ Произошла ошибка! Попробуйте ещё раз`)
						return
					} else {
						let noteMessage = '✅ Теперь уведомления '
						if (el.notifications) {
							noteMessage += 'включены'
						} else {
							noteMessage += 'отключены'
						}
						bot.sendMessage(el.chat_id, noteMessage)
					}
				})
			})
		}
	})
})
googleSheetsUpdate()
//    MySQL     connection  
const mysql = require("mysql2");

const pool = mysql.createPool({
	connectionLimit: 10000,
	host: "sql7.freemysqlhosting.net",
	user: "sql7730644",
	database: "sql7730644",
	password: "AQwxLL9Qi6"
});
let firstSqlConnect = 1
let sqlConnect = () => {
	pool.getConnection(function (err, connection) {
		if (err) {
			return console.error("Ошибка подключения SQL: " + err.message);
		}
		connection.execute("SELECT * FROM dailyProphet", function (err, res) {
			connection.release()
			if (err) {
				console.error("Ошибка извлечения данных из БД: " + err.message)
				bot.sendMessage(chatId, `⛔ Произошла ошибка! Попробуйте ещё раз`)
				return
			} else {
				whoNeedSchedule = []
				res.map(el => {
					let course = 4 - Number(el.choosen_group[3])
					listsOfData[course][0].map(groupFirstStr => {
						if (el.choosen_group == groupFirstStr) {
							whoNeedSchedule.push(el)
						}
					})
				})
				if (firstSqlConnect) {
					onListener()
					firstSqlConnect = 0
					console.log("Подключение к серверу MySQL успешно установлено");
				}

			}
		})

	});
}

// check group fn
let checkGroup = function (msg, choosenGroup) {
	let chatId = msg.chat.id
	let groupFinded = false
	pool.getConnection(function (err, connection) {
		if (err) {
			console.error("Ошибка подключения SQL(для проверки группы): " + err.message);
			return;
		}
		connection.execute("SELECT * FROM dailyProphet", function (err, res) {
			connection.release()
			if (err) {
				bot.sendMessage(chatId, `⛔ Произошла ошибка! Попробуйте ещё раз`)
				return console.error("Ошибка проверки группы в SQL: " + err.message)
			}
			res.map(el => {
				if (el.chat_id == chatId) {
					choosenGroup = el.choosen_group;
					groupFinded = true
					return
				}
			})
			if (groupFinded == false) {
				return addId(msg, choosenGroup)
			}
			checkCommands(msg, choosenGroup)
		})
	})
}

// Добавление id в бд
let addId = function (msg, choosenGroup) {
	let text = msg.text
	let chatId = msg.chat.id
	if (text != null && text != undefined && text != '') {
		if (text[0] == '/') {
			text = text.slice(1)
		}
	}
	listsOfData.map(listOfData => {
		listOfData[0].map(el => {
			if (text == el) {
				choosenGroup = String(text);
				checkCommands(msg, choosenGroup)
				const sql = "INSERT INTO dailyProphet VALUES (?, ?, 1)";
				const groupValues = [chatId, choosenGroup]
				whoNeedSchedule.push({
					chat_id: chatId,
					choosen_group: choosenGroup,
					notifications: 1
				})
				pool.getConnection(function (err, connection) {
					if (err) {
						console.error("Ошибка подключения SQL(при добавлении группы): " + err.message);
						return;
					}
					connection.execute(sql, groupValues, function (err, res) {
						connection.release()
						if (err) {
							console.error("Ошибка добавления группы в SQL: " + err.message);
							bot.sendMessage(chatId, `⛔ Произошла ошибка! Попробуйте ещё раз`)
							return
						}
					})
				})
				bot.sendMessage(chatId, `✅ Группа записана: ${text}`, {
					reply_markup: {
						keyboard: [
							['Понедельник', "Четверг"],
							['Вторник', "Пятница"],
							["Среда", "Суббота"],
							["На неделю", 'На сегодня', 'На завтра', 'Инфо']
						]
					}
				})
			}
		})
	})
	if (choosenGroup == '') {
		let justStartComms = ['/start', 'start', 'start@DailyProphetKpfuBot', '/start@DailyProphetKpfuBot']
		let justListOfCommandsVersions = ['/start', 'start', 'start@DailyProphetKpfuBot', '/start@DailyProphetKpfuBot', 'Информация', 'Инфо', '/change', 'change', '/change@DailyProphetKpfuBot', 'change@DailyProphetKpfuBot']
		if (choosenGroup == '' && (!(justListOfCommandsVersions.includes(text)))) {
			bot.sendMessage(chatId, `❌ Такой группы не существует или её нет в базе данных бота ❌`)
		}
		if (justStartComms.includes(text)) {
			checkCommands(msg, choosenGroup)
		}
	}

}

// listener сoобщений
let onListener = () => {
	bot.on('message', async msg => {
		let choosenGroup = ''
		const chatId = msg.chat.id
		for (bdString of whoNeedSchedule) {
			if (bdString.chat_id == chatId) {
				choosenGroup = bdString.choosen_group				
			}
		}
		console.log(choosenGroup, msg.text, ' от: ', msg.from.first_name)
		if (choosenGroup == '') {
			checkGroup(msg, choosenGroup)
		} else {
			checkCommands(msg, choosenGroup)
		}
	})
}

// check time function
async function checkDayAndTime() {
	let newestTime = new Date()
	let offset = newestTime.getTimezoneOffset() + 180
	let now = new Date(new Date() - 0 + offset * 60 * 1000 + 1000 * 60 * 10)
	let whichGroupNeedSchedule = []
	listsOfData.map(listOfData => {
		listOfData.map(googleString => {
			let justDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), googleString[1].split(':')[0], googleString[1].split(':')[1])
			let newDate = new Date(justDate)
			if (now.getDay() == googleString[0] && now.getHours() == newDate.getHours() && now.getMinutes() == newDate.getMinutes()) {
				for (let gIndex = 0; gIndex < googleString.length; gIndex++) {
					if (googleString[gIndex] != null) {
						if (googleString[gIndex].includes('Описание пары')) {
							let tempGroup = listOfData[0][gIndex]
							if (!(whichGroupNeedSchedule.includes(tempGroup))) {
								whichGroupNeedSchedule.push(tempGroup)
								for (let groupsFromBD of whoNeedSchedule) {
									if (groupsFromBD.choosen_group == tempGroup && groupsFromBD.notifications == 1) {
										let reminderTxt = `⏰ Через 10 минут начинается ${googleString[gIndex]}`
										reminderTxt = reminderTxt.replace(/💻 Описание пары:/gi, '')
										bot.sendMessage(groupsFromBD.chat_id, reminderTxt)
									}
								}
							}
						}
					}
				}

			}
		})
	})
}
setInterval(checkDayAndTime, 60000);

setInterval(() => {
	fetch('https://thedailyprophet.onrender.com/')
	googleSheetsUpdate()
}, 1000 * 60 * 10)