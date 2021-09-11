module.exports = {
    dateFixed: function (date) {
        let options = {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        };
        let newDate = new Date(date).toLocaleTimeString('bg-bg', options).toString();
        return newDate.split(",").join(" ");
    },
    countArr: function (arr) {
        return arr.length;
    },
    select: function (value, options) {
        return options.fn(this)
            .replace(new RegExp(' value=\"' + value + '\"'), '$& selected="selected"')
            .replace(new RegExp('>' + value + '</option>'), ' selected="selected"$&');
    },
    status: function (status) {
        return status ? 'Валидна' : 'Невалидна';
    },
    odd: function (index) {
        return index % 2 === 0 ? 1 : 2;

    },
    monthYear: function (date) {
        let options = {
            month: 'long',
            year: 'numeric',
        };
        let newDate = new Date(date).toLocaleDateString('bg-bg', options).toString();
        return newDate.split(",").join(" ");
    },
    dayMonthYear: function (date) {
        let options = {
            day: 'numeric',
            month: 'numeric',
            year: 'numeric',
        };
        let newDate = new Date(date).toLocaleDateString('bg-bg', options).toString();
        return newDate.split(",").join(" ");
    },
    day: function (date) {
        let options = {
            day: '2-digit',
        };
        let newDate = new Date(date).toLocaleDateString('bg-bg', options).toString();
        return newDate.split(",").join(" ");
    },
    week: function (date) {
        let options = {
            weekday: 'long'
        };
        let newDate = new Date(date).toLocaleDateString('bg-bg', options).toString();
        return newDate.split(",").join(" ");
    },
    time: function (date) {
        let options = {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        };
        let newDate = new Date(date).toLocaleTimeString('bg-bg', options).toString();
        return newDate.split(",").join(" ");
    },
    reverse: function (array) {
        return array.reverse()
    },
    json: function (context) {
        return JSON.stringify(context);
    },
    ifCond: function (arr1, arr2, options) {
        return arr1.length > 0 || arr2.length > 0 ? options.fn(this) : options.inverse(this);
    },
    cardStatus: function (card) {
        if (card.status) {
            if (card.cardOwner) {
                return "Валидна"
            }
            return "Неактивирана"
        }
        return 'Архивирана'
    }
}
