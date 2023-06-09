const ERRMSG = {
    0: "Неизвестная ошибка",
    1: "Один или несколько требуемых параметров не были отправлены в запросе",

    1001: "Некорректное имя пользователя",
    1002: "Некорректный пароль. Пароль должен быть не менее 8 символов длиной. Он может содержать латинские буквы, цифры, восклицательный знак и символ подчёркивания",
    1003: "Пользователь с таким именем уже зарегистрирован",
    1004: "Пользователь с таким именем не зарегистрирован",
    1005: "Пользователь с указанным ID не найден",
    1006: "Неверный пароль",
    1007: "Указан недопустимый пол (есть только два пола 🤬)",

    2001: "Неподдерживаемый формат аватара",
    2002: "Размер загружаемого файла слишком велик",
    2003: "Формат аватара не соответствует переданному заголовку `Content-Type`",

    3001: "Некорректное название лобби",
    3002: "Лобби с таким именем уже существует",
    3003: "Нет такого лобби",
    3004: "Пароль лобби не подходит",
    3005: "Лобби заполнено",
    3006: "Нет доступа к лобби",
    3007: "В лобби нет пользователя с указанным ID",
    3008: "Вы не являетесь владельцем лобби",

    4001: "Игры с указанным ID не существует",
    4002: "Вы не являетесь участником игры",
    4003: "Несвоевременное действие",
    4004: "Недостаточно ресурсов",
    4005: "Передан индекс несуществующей ячейки поля",
    4006: "В этой ячейке нельзя разместить жетон",
    4007: "Требования действия не удовлетворены",
    4008: "Ошибка проекта",

    5001: "Корпорации нет среди предложенных",
    5002: "Проекта нет среди предложенных",
    5003: "Вы уже совершили покупку",

    6001: "Не выбрано ни одного проекта для продажи",
    6002: "Невозможно продать проекты, которых нет у Вас на руке",
    6003: "Передан неверный индекс стандартного проекта",

    7001: "Невозможно заявить о более чем 3 достижениях",
    7002: "Об этом достижении уже кто-то заявил",
    7003: "Передано неверное название достижения",

    8001: "Сейчас невозможно учредить награду",
    8002: "Эта награда уже учреждена",
    8003: "Передано неверное название награды",

    9001: "Невозможно сыграть проект, которого нет у Вас на руке",
    9002: "Этим набором ресурсов нельзя оплатить проект",
    9003: "Переданных ресурсов недостаточно, чтобы оплатить проект",
    9004: "Оплатить проект можно мешьшим количеством ресурсов",
    9005: "Глобальные параметры не удовлетворены",
    9006: "Вторичные параметры не удовлетворены",

    10001: "Невозможно выполнить действие проекта, которого нет у Вас на столе",
    10002: "У этого проекта нет действия",
    10003: "Это действие уже было выполнено в текущем поколении",

    11001: "Действие корпорации UNMI может выполнять только игрок, играющий за эту корпорацию",
    11002: "Это действие можно выполнить только в качестве первого действия определённой корпорации",
};

export function errMsg(code: number) {
    if (Object.keys(ERRMSG).includes(code.toString())) {
        return ERRMSG[code as keyof typeof ERRMSG];
    }
    return `Неизвестная ошибка: ${code} (необходимо добавить локализацию)`;
}
