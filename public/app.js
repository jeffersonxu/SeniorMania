(function (){
	//Initialization
	const config = {
		apiKey: "##################################",
		authDomain: "senior-mania-5b994.firebaseapp.com",
		databaseURL: "https://senior-mania-5b994.firebaseio.com",
		projectId: "senior-mania-5b994",
		storageBucket: "",
		messagingSenderId: "772148875447"
	};

	firebase.initializeApp(config);
	const auth = firebase.auth();
	const database = firebase.database();

	const txtEmail = document.getElementById('email');
	const txtPassword = document.getElementById('password');
	const btnLogin = document.getElementById('btnLogin');
	const btnLogout = document.getElementById('btnLogout');
	const loginDiv = document.getElementById('login');
	const main = document.getElementById('main');
	const resetPass = document.getElementById('resetPass');
	const errorMsg = document.getElementById('errorMsg');
	var userEmail = "";

	//Special Conditions
	const janDouble = ["Best Selves™", "Tatusiowie", "Harverd Rejects", "Sen19rs in Predicaments"];
	const snowcoPoints = {
		"Sen19rs in Predicaments" : 400,
		"Osean's Eleven" : 800,
		"DAB ON 'EM" : 400,
		"nam" : 300,
		"Harverd Rejects" : 600
	}

	//Authentication
	btnLogin.addEventListener('click', e => {
		const promise = auth.signInWithEmailAndPassword(txtEmail.value, txtPassword.value);
		promise.catch(e => {
			if(e.code){
				errorMsg.innerHTML = e.message;
				errorMsg.style.display = "block";
			}
		});
	});

	btnLogout.addEventListener('click', e => {
		auth.signOut();
	});

	resetPass.addEventListener('click', e => {
		auth.sendPasswordResetEmail(userEmail).then(function() {
			$("#teamHeader").prepend( $('<div>', {
				class: "alert alert-success",
				role: "alert",
				text: "Password reset sent!"
			}));
		}).catch(function(error) {
			console.log(error);
		});
	})

	auth.onAuthStateChanged(user => {
	  if(user) {
	  	var userId = auth.currentUser.uid;

	  	//Parse through user data
	  	database.ref('/users/' + userId).once('value').then(function(snapshot) {
	  		var data = snapshot.val();
	  		var members = "";
	  		data['members'].forEach(function(member){
	  			members += member + ', ';
	  		});

	  		userEmail = data['email'];
	  		document.getElementById('team').innerHTML = data['name'];
	  		document.getElementById('members').innerHTML = members.slice(0, -2);
	  		document.getElementById('teamEmail').innerHTML = data['email'];
	  		document.getElementById('groupNumber').innerHTML = data['members'].length;

	  		totalPoints = 0;
	  		for(var groupKey in data['challenges']['group']){
	  			if(groupKey === 'townSigns'){
	  				document.getElementById(groupKey).innerHTML = data['challenges']['group'][groupKey][0];
	  				totalPoints += data['challenges']['group'][groupKey][0] * data['challenges']['group'][groupKey][1];
	  			} else if(data['challenges']['group'][groupKey][0] && groupKey === 'snowco') {
	  				document.getElementById(groupKey).checked = true;
	  				document.getElementById('snowcoLabel').innerHTML = snowcoPoints[data['name']] + ' points';
	  				totalPoints += snowcoPoints[data['name']];
	  			} else {
	  				if(data['challenges']['group'][groupKey][0]){
	  					totalPoints += data['challenges']['group'][groupKey][1];
	  					document.getElementById(groupKey).checked = true;
	  				}
	  			}
	  		}

	  		for(var individualKey in data['challenges']['individual']){
	  			document.getElementById(individualKey).innerHTML = data['challenges']['individual'][individualKey][0];
	  			totalPoints += data['challenges']['individual'][individualKey][0] * data['challenges']['individual'][individualKey][1];
	  		}

	  		var monthPoints = 0;
	  		for(var monthKey in data['challenges']['monthly']){
	  			if(data['challenges']['monthly'][monthKey]){
	  				if(janDouble.includes(data['name']) && monthKey === "january"){
	  					totalPoints += 1000;
	  					monthPoints += 1000;
	  					document.getElementById(monthKey).style.backgroundColor = "gold";
	  				} else {
	  					document.getElementById(monthKey).style.backgroundColor = "palegreen";
	  					totalPoints += 500;
	  					monthPoints += 500;
	  				}
	  			}
	  		}

	  		database.ref('users/' + userId).update({
	  			points: totalPoints
	  		});
	  		document.getElementById('point').innerHTML = data['points'];
	  	});

	  	//Calculate leaderboard
	  	database.ref('/users').once('value').then(function(snapshot) {
	  		var users = snapshot.val();
	  		var sortable = [];

	  		for(var user in users){
	  			sortable.push([users[user]['name'], users[user]['points'], users[user]['members']]);
	  		}

	  		sortable.sort(function(a, b) {
	  			return a[1] - b[1];
	  		});
	  		sortable.reverse();

	  		var index = 1;
	  		var temp = sortable[0][1];
	  		for (var i = 0; i < sortable.length; i++) {
	  			if(sortable[i][1] != temp){
	  				index++;
	  				temp = sortable[i][1];
	  			}

	  			var members = "";
	  			sortable[i][2].forEach(function(member){
	  				members += member + ', ';
	  			});

	  			var card = $('<div>', {
	  				class: "list-group-item list-group-item-action flex-column align-items-start"
	  			});

	  			card.append( $('<div>', {
	  				class: "d-flex w-100 justify-content-between"
	  			}).append( $('<h4>', {
	  				class: "mb-1",
	  				text: index + ". " + sortable[i][0] + ' : ' + sortable[i][1]
	  			}))).append( $('<p>', {
	  				class: "mb-1",
	  				text: members.slice(0, -2)
	  			}));

	  			$("#v-pills-leaderboard").append(card);
	  		}
	  	});
		loginDiv.style.display = "none";
	  	main.style.display = "block";
	  	btnLogout.classList.remove('hide');
	} else {
	  	loginDiv.style.display = "block";
	  	errorMsg.style.display = "none";
	  	main.style.display = "none";
	  	btnLogout.classList.add('hide');
	  	$("#teamHeader").empty();
	  	$("#team").empty();
	  	$("#point").empty();
	  	$("#teamEmail").empty();
	  	$("#members").empty();
	  	$("#groupNumber").empty();
	}
	});
}());