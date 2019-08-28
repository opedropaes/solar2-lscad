const defineTable = (ufv, type, tablenumber, day, month, year, table) => {

	day = (day > 10) ? (typeof day != "string") ? JSON.stringify(day) : day : ('0' + day).slice(-2)
	month = (month > 10) ? JSON.stringify(month) : ('0' + month).slice(-2)
	year = (typeof year != "string") ? JSON.stringify(year) : year

	let params = {}
	// console.log(ufv, type, tablenumber, day, month, year, table)

	if (ufv == 'irece') {
		if (type == 'production') {
			params = {
				TableName: "inversor_" + tablenumber + "_irece",
				ProjectionExpression: "dia_mes_ano, hora_minuto, P_AC",
				KeyConditionExpression: "dia_mes_ano = :inicio_data",
				ExpressionAttributeValues: {
					":inicio_data": parseInt(year + month + day),
					// ":inicio_data": 20190721
				}
			}
		}

		else if (type == 'environmental') {
			params = {
				TableName: "ambientais_ifba",
				KeyConditionExpression: "dia_mes_ano = :inicio",
				ProjectionExpression: "dia_mes_ano, hora_minuto, avg_radSNP1_difusa, avg_radSNP1_glob, avg_radsol_I, dir_vento, irradiancia_2_avg, irradiancia_avg, prec_chuva_tot, press_atm_avg, temp_ar_avg, umi_ar_avg, vel_vento",
				ExpressionAttributeValues: {
					":inicio": parseInt(year + month + day)
				}
			}
		}

		else if (type == 'losses') {
			params = {
				TableName: "sujidade_"+tablenumber+"_irece",
				ProjectionExpression: "#ts, #dt, perda, tot_prod, tot_ideal, limpeza_viabilidade",
				FilterExpression: "#dt between :start_ts and :end_ts",
				ExpressionAttributeNames: {
					"#ts": "timestamp",
					"#dt": "data"
				},
				ExpressionAttributeValues: {
					":start_ts": parseInt(year + month + '01'),
					":end_ts": parseInt(year + month + '31')
				}
			}
		}
	}

	else if (ufv == 'campo-grande') {
		if (type == 'production') {
			params = {
				TableName: "inversor_1_ufms",
				ProjectionExpression: "dia_mes_ano, hora_minuto, P_AC, I_AC, I_DC, V_AC, V_DC, IRR",
				KeyConditionExpression: "dia_mes_ano = :inicio_data",
				ExpressionAttributeValues: {
					":inicio_data": parseInt(year + month + day),
				}
			}
		}

		else if (type == 'environmental') {
			params = {
				TableName: "ambientais_ufms_weatherhawk",
				ProjectionExpression: "#ts, hum, rainfall, #tmp, uv, wind_dir, wind_speed",
				FilterExpression: "#ts between :start_ts and :end_ts",
				ExpressionAttributeNames: {
					"#ts": "timestamp",
					"#tmp": "temp"
				},
				ExpressionAttributeValues: {
					":start_ts": parseInt(year + month + day + '050000'),
					":end_ts": parseInt(year + month + day + '235959'),
				}
			}
		}
	}

	// console.log(params)

	return params

}

module.exports.defineTable = defineTable