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
		description: 'Поменять свою группу на новую'
	}
]).catch((err) => {
	console.error('Ошибка при установке команд:', err);
});

let checkCommands = function (msg, group) {

	let text = msg.text;
	let chatId = msg.chat.id;
	if (text != null && text != undefined && text != '') {
		if (text[0] == '/') {
			text = text.slice(1)
		}
	}
	if (text === 'start' || text == '/start' || text == '/start@DailyProphetKpfuBot' || text == 'start@DailyProphetKpfuBot') {
		// а также получить напоминание о следующей консультации
		const startMessage = `
<strong>🌟 Добро пожаловать, студент! 🌟</strong>

📅 Здесь ты можешь найти расписание своей группы 

🔍 Чтобы начать введи номер группы (например: 01-001)
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
				connection.execute(sql1, groupValues1);
				bot.sendMessage(chatId, `✅ Значение группы сброшено, введите новый номер группы`);
			} catch (err) {
				console.error('Ошибка при обновлении группы:', err);
			}
			return;
		}
	}
	if (text == 'Расписание на сегодня' && group !== '') {
		let groupIndex = listOfData[0].indexOf(group)
		let time1 = new Date()
		let offset1 = time1.getTimezoneOffset() + 180
		let time2 = new Date(new Date() - 0 + offset1 * 60 * 1000 + 1000 * 60 * 10)
		let day = time2.getDay();
		let lectionsForToday = `Расписание на сегодня: \n\n`
		listOfData.map(googleString => {
			if (day == googleString[0]) {
				if (googleString[groupIndex] != null) {
					if (googleString[groupIndex].includes('Описание пары:')) {
						lectionsForToday += `\n⏰ ${googleString[1]}-${googleString[2]}\n\n`
						lectionsForToday += googleString[groupIndex]
						// googleString[groupIndex].split('Ссылка на консультацию:').map(el => {
						// 	if (el.includes('Ссылка на видеовстресу')) {
						// 		el.split('Ссылка на видеовстресу для организатора и участников:').map(el1 => {
						// 			el1.split('Ссылка на трансляцию для зрителей:').map(el2 => {
						// 				lectionsForToday += el2
						// 			})
						// 		})
						// 	} else {
						// 	lectionsForToday += el + '\n'
						// 	}
						// })

						lectionsForToday = lectionsForToday.replace(/Ссылка на консультацию:/gi, '')
						lectionsForToday = lectionsForToday.replace(/Ссылка на консультацию: /gi, '')
						lectionsForToday = lectionsForToday.replace(/Ссылка на видеовстресу для организатора и участников:/gi, '')
						lectionsForToday = lectionsForToday.replace(/Ссылка на трансляцию для зрителей:/gi, '')
					}
				}
			}
		})
		if (lectionsForToday == `Расписание на сегодня: \n\n`) {
			lectionsForToday = '🥳 Сегодня пар нет'
		}
		bot.sendMessage(chatId, lectionsForToday, {
			disable_web_page_preview: true
		})
	}

	if (text == 'Расписание на неделю' && group !== '') {
		let weekDayNames = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье"]
		let tempWeekDay = 1
		let groupIndex = listOfData[0].indexOf(group)
		let lectionsForWeek = `
<b>Расписание на неделю:

Понедельник</b>
`
		listOfData.map(googleString => {
			let nowWeekDay = googleString[0];
			if (googleString[groupIndex] != null) {
				if (googleString[groupIndex].includes('Описание пары:')) {


					if (nowWeekDay != tempWeekDay) {
						lectionsForWeek += `\n<b>${weekDayNames[nowWeekDay-1]}</b>\n\n`
						tempWeekDay = nowWeekDay
					}
					lectionsForWeek += `⏰ ${googleString[1]}-${googleString[2]}\n\n`
					googleString[groupIndex].split('Ссылка на консультацию:').map(el => {
						if (el.includes('Ссылка на видеовстресу')) {
							el.split('Ссылка на видеовстресу для организатора и участников:').map(el1 => {
								el1.split('Ссылка на трансляцию для зрителей:').map(el2 => {
									lectionsForWeek += el2
								})
							})
						} else {
							lectionsForWeek += el + '\n'
						}
					})
					lectionsForWeek += '\n'

				}
			}
		})
		bot.sendMessage(chatId, lectionsForWeek, {
			parse_mode: 'HTML',
			disable_web_page_preview: true
		})
	}

	if (text == 'Информация' && group != '') {
		bot.sendMessage(chatId, `
Вы выбрали группу: ${group}

Если вы нашли баг или у вас есть идея по улучшению бота пишите нам ⬇️

🧑‍💻 Разработчики: <a href='t.me/chud0kot'>ChudoKOT</a>, <a href='t.me/iWanderling'>Никита Слывка</a>
`, {
			parse_mode: 'HTML',
			disable_web_page_preview: true
		})
	}
}
/* ФУНКЦИЯ КАКОГО-ТО ТАМ ЮТУБЕРА */

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
// #####################      MySQL       #######################
const mysql = require("mysql2");

const connection = mysql.createConnection({
	host: "sql7.freemysqlhosting.net",
	user: "sql7730644",
	database: "sql7730644",
	password: "AQwxLL9Qi6"
});

connection.connect(function (err) {
	if (err) {
		return console.error("Ошибка: " + err.message);
	} else {
		console.log("Подключение к серверу MySQL успешно установлено");
	}
});

// google sheets fn

let whoNeedSchedule = []
let listOfData = ['']
let firstUpdateGoogle = 1

let googleSheetsUpdate = function () {
	NodeGoogleSheets({
		values: 'Курс 1'
	}, (data) => {
		listOfData = data.data.values;
		connection.execute("SELECT * FROM dailyProphet", function (err, res) {
			if (err) {
				console.log(err)
			} else {
				if (firstUpdateGoogle) {
					res.map(el => {
						listOfData[0].map(groupFirstStr => {
							if (el.choosen_group == groupFirstStr) {
								whoNeedSchedule.push(el)
							}
						})

					})
					console.log('Google sheets подключены')
					firstUpdateGoogle = 0
				}

			}
		})
	})

}
googleSheetsUpdate()

// check group fn
let checkGroup = function (msg, choosenGroup) {
	let chatId = msg.chat.id
	let groupFinded = false
	connection.execute("SELECT * FROM dailyProphet", function (err, res) {
		if (err) {
			console.log(err)
		} else {
			res.map(el => {
				if (el.chat_id == chatId) {
					choosenGroup = el.choosen_group;
					groupFinded = true

					return
				}
			})
			if (groupFinded == false) {
				addId(msg, choosenGroup)
			}
		}
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
	listOfData[0].map(el => {
		if (text == el) {
			choosenGroup = String(text);
			const sql = "INSERT INTO dailyProphet VALUES (?, ?)";
			const groupValues = [chatId, choosenGroup]
			whoNeedSchedule.push({
				chat_id: chatId,
				choosen_group: choosenGroup
			})
			connection.execute(sql, groupValues, function (err, res) {
				if (err) {
					console.log(err);
				}
			})
			bot.sendMessage(chatId, `✅ Группа записана: ${text}`, {
				reply_markup: {
					keyboard: [
						['Расписание на сегодня'],
						["Расписание на неделю"],
						['Информация']
					]
				}
			})
		}
	})
	if (choosenGroup == '') {
		let justListOfCommandsVersions = ['/start', 'start', 'start@DailyProphetKpfuBot', '/start@DailyProphetKpfuBot', 'Информация', '/change', 'change', '/change@DailyProphetKpfuBot', 'change@DailyProphetKpfuBot']
		if (choosenGroup == '' && (!(justListOfCommandsVersions.includes(text)))) {
			bot.sendMessage(chatId, `❌ Такой группы не существует или её нет в базе данных бота ❌`)
		}
	}

}

// listener сoобщений

bot.on('message', async msg => {
	let choosenGroup = ''

	const chatId = msg.chat.id
	for (bdString of whoNeedSchedule) {
		if (bdString.chat_id == chatId) {
			choosenGroup = bdString.choosen_group
		}
	}

	if (choosenGroup == '') {
		checkGroup(msg, choosenGroup)
	}

	checkCommands(msg, choosenGroup)
})


// new check time function with parser
async function checkDayAndTime() {
	googleSheetsUpdate()
	let newestTime = new Date()
	let offset = newestTime.getTimezoneOffset() + 180
	let now = new Date(new Date() - 0 + offset * 60 * 1000 + 1000 * 60 * 10)
	let whichGroupNeedSchedule = []
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
								if (groupsFromBD.choosen_group == tempGroup) {
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
}
setInterval(checkDayAndTime, 60000);

setInterval(() => {
	fetch('https://thedailyprophet.onrender.com/')
}, 1000 * 60 * 10)
