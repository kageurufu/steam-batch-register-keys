(function() {
	var URL = 'https://store.steampowered.com/account/registerkey';
	if (document.location.href != URL) {
		document.location = URL;
		alert("Redirecting to the proper page. Run again");
		return;
	}

	async function registerKeys(keys) {
		while (keys.length) {
			var key = keys.shift();

			try {
				var success = await registerKey(key);

				console.log("registered " + success.purchase_receipt_info.line_items[0].line_item_description);
			} catch(e) {
				failures.push(key);

				OnRegisterProductKeyFailure( e.purchase_result_details, e.purchase_receipt_info );

				switch(e.purchase_result_details) {
					case 9:
						console.error("You already own " + e.purchase_receipt_info.line_items[0].line_item_description + " - Save the key " + key);
						break;
					case 53:
						console.error("You've hit the API too much for now. Try again later");
					default:
						keys.unshift(key);
						console.log("Still unregistered: ", keys);
						return;
				}
			}
		}
	}

	function registerKey(key) {
		return new Promise(function(resolve, reject) {
			new Ajax.Request('https://store.steampowered.com/account/ajaxregisterkey/',{
				method:'post',
				parameters: {
					'product_key' : key,
					'sessionid' : g_sessionID
				},
				onSuccess: function(transport){
					if ( transport.responseText ){
						try {
							var result = transport.responseText.evalJSON(true);
						} catch ( e ) {
							return reject( 0, null );
						}

						if ( result.success == 1 ) {
							return resolve( result );
						} else if ( result.purchase_result_details !== undefined && result.purchase_receipt_info ) {
							return reject( result );
						}	
					}
					return reject( 0, null );
				},
				onFailure: function(){
					return reject( 0, null );
				}
			});
		});
	}

	var toreg = prompt("Enter your keys to register, seperated by a space").trim().split(/[^-\w]+/).filter(v => !!v); 
	if (toreg.length) {
		registerKeys(toreg);
	} else {
		alert("No keys entered");
	}
})();