const Moment = require('moment');
const MomentRange = require('moment-range');

const moment = MomentRange.extendMoment(Moment);

module.exports = {
    fromTo(date,months){
        let from = moment(date, 'DD-MM-YYYY').format();
        let to = moment(date, 'DD-MM-YYYY').add(months, 'month').subtract(1, 'day').format();
        return {from,to}
    },
    checkRange(ranges,from,to){
        let persist = false;
        ranges.forEach(recharge=>{
            if (persist){
                return;
            }
            let range = moment().range(moment(recharge.from),moment(recharge.to))
            persist =range.overlaps(moment().range(moment(from),moment(to)))
        })
        return persist
    }


}
