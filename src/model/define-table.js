const defineTable = (ufv, type, tablenumber, day, month, year, table) => {

	day = (day > 10) ? (typeof day != "string") ? JSON.stringify(day) : day : ('0' + day).slice(-2)
	month = (month > 10) ? month : ('0' + month).slice(-2)
	year = (typeof year != "string") ? JSON.stringify(year) : year

	let params = {}
	// console.log(ufv, type, tablenumber, day, month, year, table)

	if (ufv == 'irece') {
		if (type == 'production') {
			params = {
				TableName: `inversor_${tablenumber}_irece`,
				ProjectionExpression: "dia_mes_ano, hora_minuto, P_AC, I_AC, I_DC, V_AC, V_DC",
				KeyConditionExpression: "dia_mes_ano = :inicio_data",
				ExpressionAttributeValues: {
					":inicio_data": parseInt(year + month + day),
				}
			}
		} else if (type == 'production-year') {
			if (tablenumber <= 5) {
				params = {
					TableName: `inversor_${tablenumber}_irece_anual`,
					ProjectionExpression: "ano, mes, averageProduction, capacityFactorAverage, higherAverage, higherAverageDay, performancesAverage, totalProductionAverage, productionsSum",
					KeyConditionExpression: "ano = :inicio_data",
					ExpressionAttributeValues: {
						":inicio_data": parseInt(year),
					}
				}
			} else if (tablenumber == 6) {
				params = {
					TableName: `inversor_${tablenumber}_irece_anual`,
					ProjectionExpression: "ano, mes, table1, table2, table3, table4, table5, table6",
					KeyConditionExpression: "ano = :inicio_data",
					ExpressionAttributeValues: {
						":inicio_data": parseInt(year),
					}
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

		else if (type == 'environmental-year') {
			params = {
				TableName: "ambientais_ifba_anual",
				KeyConditionExpression: "ano = :inicio",
				ProjectionExpression: "ano, mes, irradiation, rainfall, temperature, windSpeed",
				ExpressionAttributeValues: {
					":inicio": parseInt(year)
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
		
		else if (type == 'production-year') {
			params = {
				TableName: "inversor_1_ufms_anual",
				ProjectionExpression: "ano, mes, averageProduction, capacityFactorAverage, higherAverage, higherAverageDay, performancesAverage, totalProductionAverage, productionsSum",
				KeyConditionExpression: "ano = :inicio_data",
				ExpressionAttributeValues: {
					":inicio_data": parseInt(year),
				}
			}
		}

		else if (type == 'environmental') {
			params = {
				TableName: "ambientais_ufms",
				KeyConditionExpression: "dia_mes_ano = :inicio",
				ProjectionExpression: "dia_mes_ano, hora_minuto, massaPM1, massaPM10, massaPM2, massaPM4, numPM1, numPM10, numPM2, numPM4, tamanho_medio, #temperature, tipo, vento_dir, vento_vel, hum, irr",
				ExpressionAttributeValues: {
					":inicio": parseInt(year + month + day)
				},
				ExpressionAttributeNames: {
					"#temperature": "temp"
				},
			}
		}

		else if (type == 'environmental-year') {
			params = {
				TableName: "ambientais_ufms_anual",
				ProjectionExpression: "ano, mes, temperature, irradiation, windSpeed, rainfall, PM1, PM2",
				KeyConditionExpression: "ano = :inicio",
				ExpressionAttributeValues: {
					":inicio": parseInt(year)
				}
			}
		}

	}

	return params

}

module.exports.defineTable = defineTable