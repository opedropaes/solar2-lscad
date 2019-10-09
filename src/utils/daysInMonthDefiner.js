module.exports = {
	howMayDaysThisMonth (month) {

		if (month == 2)
			return 28;
		
		if (month < 8) {
			if (month % 2 != 0)
				return 31;
			else 
				return 30; 
		} else {
			if (month % 2 != 0)
				return 30;
			else 
				return 31;
		}
			
	}
}