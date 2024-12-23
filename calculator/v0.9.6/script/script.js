

// Configure the time zone
luxon.Settings.defaultZone = "Asia/Kolkata";
const MIN = 1000;
const CEILING1 = 6500;
const CEILING2 = 15000;
const ELG_DAYS = 3465;
const getDate = function(date) {
	if(date) {
		var x = new Date(luxon.DateTime.fromJSDate(date).toISODate())
		return luxon.DateTime.fromJSDate(x).minus({minutes:330})
	} else
		return luxon.DateTime();
}
const CURRENT_DATE  = getDate(new Date()).toJSDate();
const LIMIT_MIN     = getDate(new Date('2011-04-01')).toJSDate();
const LIMIT_MAX     = getDate(new Date()).toJSDate();
const MIN_DOB       = getDate(LIMIT_MIN).minus({years: 58}).toJSDate();
const MAX_DOB       = getDate(new Date()).minus({years: 50}).toJSDate();
const CEILING1_DATE = getDate(new Date('1995-11-16')).toJSDate();
const CEILING2_DATE = getDate(new Date('2014-09-01')).toJSDate();
const ELG_DATE1     = getDate(new Date('2015-03-26')).toJSDate();
const DEFER_DATE = getDate(new Date('2016-04-25')).toJSDate();
const EARLY_PERC_CHANGE_DATE = getDate(new Date('2008-11-26')).toJSDate();
//console.log("current,min,max,mindob,maxdob,ceiling1,ceiling2,elgdate1,earlyperc",[CURRENT_DATE,LIMIT_MIN,LIMIT_MAX,MIN_DOB,MAX_DOB,CEILING1_DATE,CEILING2_DATE,ELG_DATE1,EARLY_PERC_CHANGE_DATE]);
const download = function () {
		window.print();
	}

const BASIC_DEFAULT = {
	'dob': 0,
	'date58':getDate(LIMIT_MIN).minus({years: 1, days:1}).toJSDate(),
	'date50':getDate(LIMIT_MIN).minus({years: 9, days:1}).toJSDate(),
	'avail58':getDate(LIMIT_MIN).minus({years: 1}).toJSDate(),
	'avail50':getDate(LIMIT_MIN).minus({years: 1}).toJSDate(),
	'minAD':getDate(LIMIT_MIN).minus({years: 8}).toJSDate()
}

const SERVICE_INPUT_DEFAULT = {
	'doj': 0,
	'doe': 0,
	'ncp1':0,
	'ncp2':0,
	'ncp1edit':0,
	'ncp2edit':0
}

const SUPERANNUATION_DEFAULT = {
	"pension":0,
	"availing_date":0,
	"age":0,
	"doe":0,
	"agedoe":0
}

const getDate_ddmmyyyy =function (date) {

    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2,'0');
    const dd = String(date.getDate()).padStart(2,'0');

    return `${dd}-${mm}-${yyyy}`
}


const TOTAL_DEFAULT = {
	'doj':new Date(),
	'doe':new Date(),
	'ncp1':0,
	'ncp2':0,
	'monthsbefore':0,
	'monthsafter':0,
	'daysbefore':0,
	'daysafter':0
}

const round = (n, dp,bool=0) => {
	var val=0
	const h = +('1'.padEnd(dp + 1, '0')) // 10 or 100 or 1000 or etc
	val = Math.round(n * h) / h;
	return val;
};


const get_earlyReductionAmount = function (superannuation,availing_date,years_to_58) {
	var amount = 0;
	if(availing_date<EARLY_PERC_CHANGE_DATE) {
		amount = superannuation - round(superannuation*Math.pow(1-0.03,years_to_58));
	} else {
		amount = superannuation - round(superannuation*Math.pow(1-0.04,years_to_58));
	}
	return amount;
}



const get_pension = function (total,psalary,dob, availing_date){
	console.log(total)
	var days1 = total.daysbefore;
	var days2 = total.daysafter;
	var ncp1 = total.ncp1;
	var ncp2 = total.ncp2;
	var weightage = total.weightage;
	var psal = psalary;
	var pension={};
	
	if(!days1 && !days2){
		pension.superannuation = 0;
	} else if((days1-ncp1)<0 || (days2-ncp2)<0) {
		pension.superannuation = 0;
	} else if(days2==0){
		eligible1=eligible1 = days1-ncp1+365*weightage;
		p1 = eligible1*psal/(70*365);
		pension.superannuation = round(p1);
	} else {
		eligible1 = days1-ncp1+365*weightage;
		eligible2 = days2-ncp2;
		psal1=psal>6500?6500:psal;
		p1 = eligible1*psal1/(70*365);
		p2 = eligible2*psal/(70*365);
		pension.superannuation = round(p1+p2);
	}
	
	var age = getDifference(dob, availing_date, "Years", "both");
	var years_to_58 = 58-age;
	console.log("age, years_to_58", age,years_to_58);
	pension.earlyreduction = get_earlyReductionAmount(pension.superannuation,availing_date,years_to_58);
	if(pension.earlyreduction) {
		pension.early= pension.superannuation - pension.earlyreduction;
	}
	if(pension.early<1000 && availing_date>CEILING2_DATE) {
		pension.earlymin=1000-pension.earlyreduction;
	}
	if(pension) {
		log("get_pension:(days1,days2, ncp1, ncp2,psal, wt, pension,early reduction)",[days1,days2,ncp1,ncp2,psalary,weightage,pension.superannuation,pension.earlyreduction]);
	}
	return pension;
}

function getDays (date1, date2, withEndDate=1) {
	var date21 = luxon.DateTime.fromISO(date2).plus({'days':withEndDate}).toJSDate();
	var interval = luxon.Interval.fromDateTimes(date1, date21);
	var months_between = Math.floor(interval.length('Months'));
	var Y = Math.floor(months_between/12);
	var M = months_between - Y*12; //Math.floor(interval.length('Months')%12);
	var date1_modified = date1.plus({months: months_between });
	var interval2 = luxon.Interval.fromDateTimes(date1_modified, date21);
	var D = interval2.length('Days');
	var days = ((Y*365)+(M)*30)+D;
	log("getDays,Date1,Date2,days,Y,M,D",[date1,date2,days,Y,M,D]);
	return days;
}

const getServiceStr = function(days) {
	if(typeof(days)!='number' && days<0) {
		return 'No service added or Not a valid Input';
	} else {
		let Y, M, D, str;
		Y = Math.floor(days/365);
		M = Math.floor((days - Y*365)/30);
		if(M>=12) {
				Y=Y+1;
				M=M-12;
		}
		D = Math.floor(days - Y*365 -M*30);
		str = Y.toString()+' Years,'+M.toString()+' Months,'+D.toString()+' Days';
		return str;
	}
}

function getDifference(d1, d2, unit="Days", period="both", withEndDate=1) {
	//date1 is initial date
	//date2 is final date
	//unit is unit which is to be used for finding the difference
	//period both=total, before=Before 01-09-2014, after=after 2014
	//withEndDate 1=true, 0=false
	//return -1 if any error
	
	if(period=="before" && d2>CEILING2_DATE) {
		d2 = getDate(CEILING2_DATE).minus({days: 1}).toJSDate();
		if(d1<CEILING1_DATE) {
			d1=CEILING1_DATE;
		} else if(d1>CEILING2_DATE){
			return 0;
		}
	} else if(period=="after" && d1<CEILING2_DATE) {
		d1= CEILING2_DATE;
		if(d2<CEILING2_DATE){
			return 0;
		}
	}
	if(d1==d2) return 0;
	date1= getDate(d1);
	date2= getDate(d2);
	var interval = luxon.Interval.fromDateTimes(date1, date2);
	if (interval.invalid) {
		console.log(interval);
		log("getDifference1: Error:",["Invalid Input",date1,date2,d1,d2])
		return -1;
	} else if(!['Years','Months','Days'].includes(unit) || !["both","before","after"].includes(period) || ![0,1].includes(withEndDate)){
		log("getDifference: Error:",["Invalid Input"])
		return -1;
	} 
	
	
	if(unit=="Days") {
		days = getDays (date1, date2, withEndDate);
		return days;
	} else if (unit=="Years" || unit=="Months") {
		interval = luxon.Interval.fromDateTimes(date1, date2.plus({'days':1}));
		return Math.floor(interval.length(unit));
	} 
	
	return -1;
}

function log(str, array) {
	console.log("Log:", str,":")
	let text = array.join();
	if(array.length) console.log(text);
}

function dateRangeOverlaps(a_start, a_end, b_start, b_end) {
	if (a_start <= b_start && b_start <= a_end) return true; // b starts in a
	if (a_start <= b_end   && b_end   <= a_end) return true; // b ends in a
	if (b_start <  a_start && a_end   <  b_end) return true; // a in b
	return false;
}

function multipleDateRangeOverlaps(dates) {
	var i, j;
	if (dates.length % 2 !== 0)
		throw new TypeError('Arguments length must be a multiple of 2');
	for (i = 0; i < dates.length - 2; i += 2) {
		for (j = i + 2; j < dates.length; j += 2) {
			if (
				dateRangeOverlaps(
					dates[i], dates[i+1],
					dates[j], dates[j+1]
				)
			) return true;
		}
	}
	return false;
}

function validateService(service, dob){
	if(typeof(service.doj)!="object" || typeof(service.doe)!="object" || typeof(service.ncp1) !="number" || typeof(service.ncp2) !="number") {
		log("validateService:",["Type not matching."]);
		return 0;
	} else {
		//alert(getDifference(dob,service.doe,'Years',"both")>60)
		var max_avail_date=0;
		/*if(service.doe>=new Date('2016-04-25')){
			lastdate = getDate(dob).plus({years: 60}).toJSDate();
		} else 
		{*/
			max_avail_date = getDate(dob).plus({years: 58}).toJSDate();
			log("lastdate",[max_avail_date]);
		//}
	}
	if(service.doj>=service.doe) {
		log("validateService:",["DOJ can not be after DOE."]);
		alert("DOJ can not be equal to or later than DOE. Service not added.");
		return 0;
	} else if (service.doj<CEILING1_DATE) {
		log("validateService:DOJ can not be less than 16-11-1995.",[service.doj,CEILING1_DATE]);
		alert("The current version of calculator does not handle past service. DOJ should be equal to or later than 16-11-1995. Service not added.");
		return 0;
	} else if(service.doj<dob) {
		log("validateService:",["DOJ can not be earlier than DOB."]);
		alert("service date can not be before date of birth.service not added.")
		return 0;
	} else if(service.doe>=max_avail_date) {
		console.log(service.doe,max_avail_date,service.doe>max_avail_date)
		log("validateService:",["DOE can not be more than age 60/58."]);
		alert("The current version of calculator is only for Superannuation Pension and Early Pension. DOE can not be greater than date of superannuation. Service not added.")
		return 0;
	} else {
		var daysbefore   = getDifference(service.doj,service.doe,'Days',"before");
		var daysafter    = getDifference(service.doj,service.doe,'Days',"after");
		if (daysbefore<service.ncp1 || daysafter<service.ncp2 || (daysbefore+daysafter)<(service.ncp1+service.ncp2)) {
			alert("NCP  days not tallying with the service details. Service not added")
			return 0;
		}
		return 1;
	}
	return 1;
}