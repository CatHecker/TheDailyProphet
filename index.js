const TelegramApi = require('node-telegram-bot-api')
require('dotenv').config();
// token apply 
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
	if (text === '/start') {
		const startMessage = `
<strong>Добро пожаловать, студент!</strong>

Здесь ты можешь найти расписание своей группы, а также получить напоминание о следующей консультации

Чтобы начать введи номер своей группы (например: 01-001)
		`
		bot.sendMessage(chatId, startMessage, {
			parse_mode: 'HTML'
		})
		return
	}

	if (text === '/change' && group !== '') {
		
		for (let i = 0; i < whoNeedSchedule.length; i++) {
			if (whoNeedSchedule[i].chat_id == chatId) {
				
				whoNeedSchedule.splice(i, 1)
				break
			}
		}
		//console.log(whoNeedSchedule)
		group = ''
		
		const sql1 = "DELETE FROM dailyProphet WHERE chat_id = ?";
		const groupValues1 = [chatId];

		try {
			connection.execute(sql1, groupValues1);
			bot.sendMessage(chatId, `Значение группы сброшено, введите новый номер группы`);
		} catch (err) {
			console.error('Ошибка при обновлении группы:', err);
		}
		return;
	}
	if (text == 'Расписание на сегодня' && group !== '') {
		let groupIndex = listOfData[0].indexOf(group)
		const getScheduleForToday = new Date();
		let day = getScheduleForToday.getDay();
		let lectionsForToday = `Расписание на сегодня: \n`
		listOfData.map(googleString => {
			if (day == googleString[0]) {
				if (googleString[groupIndex] != null && groupIndex > 2) {
					lectionsForToday = lectionsForToday + '\n' + `${googleString[1]}-${googleString[2]} -  ${googleString[groupIndex]}` + '\n'
				}
			}
		})
		bot.sendMessage(chatId, lectionsForToday)
	}

	if (text == 'Расписание на неделю' && group !== '') {
		let weekDayNames = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье"]
		let tempWeekDay = 1
		let getScheduleForWeek = new Date()

		let groupIndex = listOfData[0].indexOf(group)
		let lectionsForWeek = `
<b>Расписание на неделю:

Понедельник</b>
`
		listOfData.map(googleString => {
			let nowWeekDay = googleString[0];
			if (googleString[groupIndex] != null && googleString[groupIndex] != '' && groupIndex > 2 && googleString[1] != 'Начало') {
				if (nowWeekDay != tempWeekDay) {
					lectionsForWeek += `\n<b>${weekDayNames[nowWeekDay-1]}</b>\n`
					tempWeekDay = nowWeekDay
				}
				href = `h${googleString[groupIndex].split('h')[1]}`
				lectionsForWeek = lectionsForWeek + `
<a  href="${href}">${googleString[groupIndex].split('h')[0]}</a>
${googleString[1]}-${googleString[2]}
`
			}
		})
		bot.sendMessage(chatId, lectionsForWeek, {
			parse_mode: 'HTML'
		})
	}

	if (text == 'Информация' && group != '') {
		bot.sendMessage(chatId, `
Вы выбрали группу: ${group}

Разработчики: <a href='t.me/chud0kot'>ChudoKOT</a>, <a href='t.me/iWanderling'>Никита Слывка</a>
`, {
			parse_mode: 'HTML'
		})
	}
}
/* ФУНКЦИЯ КАКОГО-ТО ТАМ ЮТУБЕРА */

const {
	google
} = require("googleapis");

function NodeGoogleSheets(keyMass, fun) {
	const auth = new google.auth.GoogleAuth({
		keyFile: "./google_file.json",
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
let whoNeedSchedule = []
let listOfData = []
let firstUpdateGoogle = 1
let googleSheetsUpdate = function () {
	NodeGoogleSheets({
		values: 'list1'
	}, (data) => {
		listOfData = data.data.values.slice();
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
			bot.sendMessage(chatId, `Группа записана: ${text}`, {
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
		if (choosenGroup == '' && text != '/start' && text != 'Информация') {
			bot.sendMessage(chatId, `Такой группы не существует или её нет в базе данных бота`)
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


// Проверка времени
// new check time function with parser
async function checkDayAndTime() {
	googleSheetsUpdate()
	let now = new Date(new Date() - 2 * 60 * 60 * 1000 + 1000 * 60 * 10)
	let whichGroupNeedSchedule = []
	listOfData.map(googleString => {
		let justDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), googleString[1].split(':')[0], googleString[1].split(':')[1])
		let newDate = new Date(justDate + 1000 * 60 * 10)
		//console.log(newDate.getHours(), newDate.getMinutes())
		if (now.getDay() == googleString[0] && now.getHours() == newDate.getHours() && now.getMinutes() == newDate.getMinutes()) {
			for (let gIndex = 0; gIndex < googleString.length; gIndex++) {
				if (googleString[gIndex] != '' && gIndex > 2) {
					let tempGroup = listOfData[0][gIndex]
					if (!(whichGroupNeedSchedule.includes(tempGroup))) {
						whichGroupNeedSchedule.push(tempGroup)
						for (let groupsFromBD of whoNeedSchedule) {
							if (groupsFromBD.choosen_group == tempGroup) {
								bot.sendMessage(groupsFromBD.chat_id, `Через 10 минут начинается ${googleString[gIndex]}`)
							}
						}
					}
				}
			}

		}
	})
}
setInterval(checkDayAndTime, 60000);

