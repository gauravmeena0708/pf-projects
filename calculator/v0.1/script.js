const MIN = 1000;
const CEILING1 = 6500;
const CEILING2 = 15000;
const CEILING1_DATE = new Date('1995-11-16');
const CEILING2_DATE = new Date('2014-09-01');

const BASIC_DEFAULT =  {
	'uan':100000000000,
	'name': "John Doe",
	'dob': new Date('1953-04-04'),
	'availing_date':new Date('2011-04-04'),	
	'age':0,
	'dod':0,
	'dod_date':new Date()
};

const SUPERANNUATION_DEFAULT = {
	"total_month_psal":60,
	"total_wage_psal":60*15000,
	"total_ncp_psal":0,
	"weightage":0,
	"eligible":0,
	"eligible_WB":0,
	"min":0,
	"pservice":0,
	"psalary":0,
	"pension1":0,
	"pension2":0,
	"pension3":0,
	"last_wage":0,
	'greater':0
}

const WB_DEFAULT = {
	"wage1":CEILING1,
	"wage2":CEILING2,
	"years1":0,
	"years2":0,
	"avg_wage":0,
	"years" :0,
	"factor":0,
	"amount":0
};

const SERVICE_DEFAULT = {
	'actual':0,
	'eligible': 0,
	'eligible1':0,
	'months1': 0,
	'months2': 0,
	'avg_wage1':CEILING1,
	'avg_wage2':CEILING2,
	'ncp1':0,
	'ncp2':0,
	'days95':0,
	'total_ncp':0,
	'wage95':0,
	'factor':0,
	'past_pension':0
}
	
const SERVICE_INPUT_DEFAULT = {
	'doj': new Date('1997-10-07'),
	'doe': new Date('2014-08-31'),
	'ncp1':0,
	'ncp2':156
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



const download = function () {
	window.print();
};
	
const round = (n, dp) => {
	const h = +('1'.padEnd(dp + 1, '0')) // 10 or 100 or 1000 or etc
	return Math.round(n * h) / h
};
		
function get_WB_Wage(year1,year2,wage1,wage2) {
	return round(((year1*wage1)+(year2*wage2))/(year1+year2))
};
			
function get_WB_Factor(years) {
	return TABLED[years]||0
};

function getDiff(d1, d2, str, withbool=1) {
	date1= luxon.DateTime.fromJSDate(d1);
	date2= luxon.DateTime.fromJSDate(d2);
	var interval = luxon.Interval.fromDateTimes(date1, date2);
	if(str=="days") {
		Y = Math.floor(interval.length('Years'));
		M = Math.floor(interval.length('Months')%12);
		D = Math.floor(interval.length('Days')%30);
		//console.log("Y,M,D:",Y,M,D);
		y1 = d1.getYear();
		y2 = d2.getYear();
		m1 = d1.getMonth();
		m2 = d2.getMonth();
		day1 = d1.getDay();
		day2 = d2.getDay();
		//if(day2
		if (m2<m1) {
			years= years<0?0:years;
		}
		years = d2.getYear()-d1.getYear();
		
		//console.log(years);
		months = d2.getMonth()-d1.getMonth()-(years*12);
		months = months<0?0:months;
		console.log(years,months);
		console.log(d2.getYear(),d1.getYear(),d2.getMonth(),d1.getMonth())
		
	}
	var diffUnits = 0;
	if(!withbool){
		diffUnits = Math.floor(interval.length(str))+1;
		return diffUnits>=1?diffUnits:0;
	} else {
		diffUnits = interval.count(str)+1;
		return diffUnits>=1?diffUnits:0;
	}
};

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

function getCeilingDuration(doj,doe, str, before=1) {
	unit = 0
	if(before==2) {
		if(doj>CEILING2_DATE){
			unit = 0;
		} else {
			unit = getDiff(doj, CEILING1_DATE, str)-1;
		}	
	} else if(before==1){
		if (doj >= CEILING2_DATE) {
			console.log("both DOJ DOE are greater");			
		} else {
			if(doe < CEILING2_DATE) {
				if(doj<CEILING1_DATE) {
					unit = getDiff(CEILING1_DATE, doe, str);
				} else {
					unit = getDiff(doj,doe,str);
				}
			} else {
				if(doj<CEILING1_DATE) {
					unit = getDiff(CEILING1_DATE, CEILING2_DATE, str)-1;
				} else {
					unit = getDiff(doj, CEILING2_DATE, str)-1;
				}
			}
		}
	} else {
		if (doe < CEILING2_DATE) {
			console.log("both DOJ DOE are lesser");			
		} else {
			if(doj >= CEILING2_DATE) {
				unit = getDiff(doj,doe,str);
			} else {
				unit = getDiff(CEILING2_DATE, doe, str);
			}
		}
	}
	return unit>=1?unit:0;
}

function get_earlyPension(age, amount,ad) {
	diff = 58 - age;
	date1 = new Date('2008-11-26');
	if(ad<date1){
		deduction = round(amount*0.03*diff);
	} else {
	deduction = round(amount*0.04*diff);
	}
	early_pension = amount-deduction;

	return early_pension>0?early_pension:0;
}

function get_deferredPension(age,amount) {
	diff = age- 58;
	deferred_pension = round(amount*(1+(0.4*diff)),0);
	return (diff>2||diff<0)?amount:deferred_pension;
}

function get_psalary(wage_sum, ncp, bool=0){
	var total = bool<1?365:1825;
	var denom = total-ncp;
	return denom>0?round(wage_sum*30/denom):0;
}

function get_pension(days1,days2,ncp1,ncp2,psal,wt){
	if((days1-ncp1)<0 || (days2-ncp2)<0) {
		return 0;
	} else {
		eligible1 = days1-ncp1+365*wt;
		eligible2 = days2-ncp2;
		p1 = eligible1*6500/(70*365);
		p2 = eligible2*psal/(70*365);
		
		pension = round(p1+p2);
		return pension;
	}
}

function findElement(data, attr, value, retattr){
	var found = data.find(function(element) {
		return element[attr] == value;
	});
	return found[retattr]?found[retattr]:0;
}

function getWageC(wage, dod) {
	var val =0;
	
	if(wage<=300){
		val =300;
	} else if(wage>=CEILING1 && dod< CEILING2_DATE) {
		console.log(wage,dod, CEILING2_DATE);
		val = CEILING1;
	} else if(wage>=CEILING2) {
		val = CEILING2;
	} else {
		val = Math.round(wage / 50) * 50
	}
	
	return val;
}


var TABLEB = [];
var TABLEC = [];
var TABLED = [];

var app = angular.module('myApp', ['ngCookies']);
app.controller('namesCtrl', ['$scope','$cookies','$cookieStore', '$http', function($scope,$cookies,$cookieStore, $http) {

	
	//function to call if basic details are changed
	$scope.updateBasic= function(){
		$scope.basic.age = getDiff($scope.basic.dob,$scope.basic.availing_date, "years",0);
	}

		
	function updateEligibility() {
		console.log('eligibility called');
		if($scope.services.length ==0) {
			$scope.eligibility = 0;
			$scope.eligibilityMsg = "You have not added any service. please add Service.";
		} else if($scope.basic.dod) {
			$scope.eligibility = 3;
			$scope.eligibilityMsg = "You are eligible for Family Pension.";
		} else if($scope.basic.age<50) {
			if($scope.service.eligible<180) {
				$scope.eligibility = 0;
				$scope.eligibilityMsg = "You are not eligible for any benefit as your service is less than 180 days. You may however transfer your service to new account to add service.";
			} else if($scope.service.eligible>3420) {
				$scope.eligibility = 0;
				$scope.eligibilityMsg = "You are not eligible for as your service is more than 9.5 Years(3420) but age is less than 50 years. You may apply for scheme certificate or transfer the service to future establishment.";
			} else if($scope.service.eligible>=180 && $scope.service.eligible<=3420) {
				$scope.eligibility = 1;
				$scope.eligibilityMsg = "You are eligible for withdrawal benefit below is the calculator for Withdrawal benefit. However, it is advised that the service may be transferred to new establishment to become eligible for pension.";
			}
		} else if($scope.basic.age>=50 && $scope.basic.age<58) {
			if($scope.service.eligible<180) {
				$scope.eligibility = 0;
				$scope.eligibilityMsg = "You are not eligible for any benefit as your service is less than 180 days.";
			} else if($scope.service.eligible>3420) {
				$scope.eligibility = 2;
				$scope.eligibilityMsg = "You are eligible for Early Pension. However, it is advised to apply for pension after attaining the age of 58 to avoid reduced pension.";
			} else if($scope.service.eligible>=180 && $scope.service.eligible<=3420) {
				$scope.eligibility = 1;
				$scope.eligibilityMsg = "You are eligible for withdrawal benefit below is the calculator for Withdrawal benefit.";
			}
		} else if($scope.basic.age>=58){
			if($scope.service.eligible<180) {
				$scope.eligibility = 0;
				$scope.eligibilityMsg = "You are not eligible for any benefit as your service is less than 180 days.";
			} else if($scope.service.eligible>3420) {
				$scope.eligibility = 2;
				$scope.eligibilityMsg = "You are eligible for Pension.";
			} else if($scope.service.eligible>=180 && $scope.service.eligible<=3420) {
				$scope.eligibility = 1;
				$scope.eligibilityMsg = "You are eligible for withdrawal benefit below is the calculator for Withdrawal benefit.";
			}
		}
	}
	
	function getTotal() {
		var total = _.reduce($scope.services, function(acc, o) {
				for (var p in o)
					acc[p] = (p in acc ? acc[p] : 0) + o[p];
					return acc;
				}, {});
		$scope.service.actual=total.daysbefore+total.daysafter - round((total.yearsbefore+total.yearsafter)/4);
		var eligible = total.daysbefore+total.daysafter-total.ncp1-total.ncp2- round((total.yearsbefore+total.yearsafter)/4);
		$scope.service.eligible= eligible>0?eligible:0;
		$scope.service.months1= total.monthsafter>60?0:60-total.monthsafter;
		$scope.service.months2= total.monthsafter>60?60:total.monthsafter;
		$scope.service.ncp1=total.ncp1;
		$scope.service.ncp2=total.ncp2;
		$scope.service.total_ncp=total.ncp2+total.ncp1;
		days1 = total.daysbefore>total.ncp1?total.daysbefore-total.ncp1:0;
		days2 = total.daysafter>total.ncp2?total.daysafter-total.ncp2:0;
		$scope.years1 = round(days1/365,2);
		$scope.years2 = round(days2/365,2);
		return total;
	}
	
	$scope.addService = function(){
		
		var doj = $scope.service_input.doj;
		var doe = $scope.service_input.doe;
		var ncp1 = $scope.service_input.ncp1;
		var ncp2 = $scope.service_input.ncp2;
		var res = (doe - doj) / 1000 / 60 / 60 / 24;
		console.log(res);
		var date71 = new Date("1971-03-04");
		
		var date1 = $scope.dates.slice();
		$scope.dates.push(doj);
		$scope.dates.push(doe);
		
		if(multipleDateRangeOverlaps($scope.dates)){
			alert("Date range overlapping. returning to previous state");
			$scope.dates = date1.slice();
		} else if (doj>doe) {
			alert("DOJ can not be later than DOE");
			$scope.dates = date1.slice();
		} else if (doj<$scope.basic.dob) {
			alert("DOJ can not be earlier than DOB");
			$scope.dates = date1.slice();
		} else if (doj<date71) {
			alert("DOJ can not be less than Family pension scheme date.");
			$scope.dates = date1.slice();
		} else {
			var service = {
				'doj':doj,
				'doe':doe,
				'ncp1':ncp1,
				'ncp2':ncp2,
				'days95':getCeilingDuration(doj,doe,'days',2),
				'monthsbefore':getCeilingDuration(doj,doe,'months',1),
				'monthsafter':getCeilingDuration(doj,doe,'months',0),
				'daysbefore':getCeilingDuration(doj,doe,'days',1),
				'yearsbefore':getCeilingDuration(doj,doe,'years',1),
				'yearsafter':getCeilingDuration(doj,doe,'years',0),
				'daysafter':getCeilingDuration(doj,doe,'days',0)
			};
			
			$scope.services.push(service);
			//$scope.total = getTotal();
			$scope.update();	
		}
	}
	
	$scope.removeService = function(index) {
		if(index >= 0){
			$scope.dates.splice(index*2, 2);
			$scope.services.splice(index, 1);
			//$scope.total = getTotal();
			$scope.update();	
		}
	}
	
	$scope.eligibility = 0;
	$scope.eligibilityMsg="You have not added any service. PLease add service to check eligibility."
	
	$scope.update_Superannuation = function(){
		$scope.pension.total_month_psal=$scope.total.daysafter?60:12;
		$scope.pension.eligible = $scope.service.actual - $scope.service.total_ncp;
		if($scope.basic.age>=58 && $scope.pension.eligible+$scope.total.days95>7300){
			$scope.pension.weightage = 2;	
		} else {
			$scope.pension.weightage = 0;
		}
		$scope.pension.eligible_WB= $scope.pension.eligible+365*$scope.pension.weightage;
		
		$scope.pension.min= $scope.pension.eligible>3650? MIN:0;
		$scope.pension.total_month_psal = $scope.service.months2>0?60:12;
		
		$scope.pension.psalary = get_psalary($scope.pension.total_wage_psal,$scope.pension.total_ncp_psal,$scope.total.daysafter);
		$scope.pension.pension1 = get_pension($scope.total.daysbefore,$scope.total.daysafter,$scope.total.ncp1,$scope.total.ncp2,$scope.pension.psalary,$scope.pension.weightage);
		$scope.pension.pension2 = $scope.pension.pension1>MIN?$scope.pension.pension1:MIN;
		$scope.pension.pension3 = get_earlyPension($scope.basic.age,$scope.pension.pension2, $scope.basic.availing_date);
	}
	
	$scope.WB_update = function() {
		$scope.WB.years1 = $scope.years1;
		$scope.WB.years2 = $scope.years2;
		$scope.WB.years = round($scope.WB.years1 + $scope.WB.years2);
		
		if($scope.WB.years>9||$scope.WB.years<=0){
			$scope.alert = "The total years of service should be greater than 0.5 and less than 9.5"
		} else {
			$scope.alert = false;
			$scope.WB.avg_wage = get_WB_Wage($scope.WB.years1,$scope.WB.years2,$scope.WB.wage1,$scope.WB.wage2);
			$scope.WB.factor = get_WB_Factor($scope.WB.years);
			$scope.WB.amount = round($scope.WB.factor*$scope.WB.avg_wage);
		}
	}
	
	$scope.familyPension = function(){
		val = getWageC($scope.pension.last_wage,$scope.dod)
		found = findElement(TABLEC,"salary",val,"pension");
		$scope.pension.pension4 = found;
		$scope.pension.pension5= Math.max($scope.pension.min, $scope.pension.pension3, $scope.pension.pension4)
	}
	
	
	function get_wage95(days, bool) {
		years95= round(days/365,0);
		TABLEE=[[80,95,120,150],[85,105,135,170]];
		if(years95<12) {
			return TABLEE[bool][0];
		} else if(years95>=12 && years95<16){
			return TABLEE[bool][1];
		} else if(years95>=16 && years95<20){
			return TABLEE[bool][2];
		} else if(years95>=20){
			return TABLEE[bool][3];
		} else {
			return 0;
		}
	}
	
	function get_factor95(dob) {
		ageon95 = getCeilingDuration(dob,CEILING1_DATE,'years',2);
		yearsto58 = 59 - ageon95;
		years = yearsto58>34?34:yearsto58;
		factor = findElement(TABLEB, "years", years, "factor");
		return factor;
	}
	$scope.update_past = function(){
		$scope.pension.wage95 = get_wage95($scope.total.days95,$scope.pension.greater);
		$scope.pension.factor = get_factor95($scope.basic.dob)
		//yearsto58=58$scope.basic.age
		$scope.pension.past_pension = round($scope.pension.wage95*$scope.pension.factor,0);
	}
	
	$scope.update = function() {
		console.log("update called")
		$scope.total=getTotal();
		$scope.updateBasic();
		updateEligibility();		
		$scope.WB_update();
		$scope.update_past();
		$scope.update_Superannuation();
		if($scope.basic.dod){
			$scope.familyPension();
		}
		
	}
	
	$scope.initiatilize = function (){
		$scope.basic = BASIC_DEFAULT;
		$scope.dates=[];
		$scope.services=[];
		$scope.service = SERVICE_DEFAULT;
		$scope.service_input  = SERVICE_INPUT_DEFAULT;
		$scope.WB = WB_DEFAULT;
		$scope.pension = SUPERANNUATION_DEFAULT;
		$scope.total=TOTAL_DEFAULT;
		
		$scope.update()
	}	
	$http({
		method: 'GET',
		url: './data.json'
	}).then(function (success){
		console.log("json downloaded");
		TABLEB = success.data.TABLEB;	
		TABLEC = success.data.TABLEC;
		TABLED = success.data.TABLED;
		$scope.initiatilize();
	},function (error){
		console.log(error)
	});
	
	
 }]);