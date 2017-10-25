var tt_helpers = {
	is_JSON: function(data){
		if(typeof data === "string" && isNaN(+data)) {

			try {
				JSON.parse(data);
			} catch (e) {
				return false;
			}

			return true;

		}
		else {
			return false;
		}
	},

	get_time_string: function(sec){
		var h = sec/3600 ^ 0,
			m = (sec-h*3600)/60 ^ 0,
			s = Math.round(sec-h*3600-m*60);
		return (h?h+":":"")+(m<10?"0"+m:m)+":"+(s<10?"0"+s:s);
	}
};