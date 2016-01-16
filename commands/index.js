const CHAT_GROUP_ID = -69948627;

'use strict';

var moment = require('moment');
var commands = require('../modules/command-manager');
var orari = require('../modules/orari-roma3');
var dipartimenti = require('../modules/dipartimenti');
var User = require('../modules/user-manager').User;
var errors = require('../lib/errors');
var db = require('../modules/database').db;



var handleError = function (err, msg, telegramBot) {
    telegramBot.sendMessage(msg.chat.id, "Si è verificato un errore, verrà risolto al più presto");
    console.error(err.stack);
};

var listaComandi = '/insulted - Insulta i tuoi amici!' +
    '\n/spotted - Apprezza qualcuno, potresti essere ricambiato!' +
    '\n/claim - Ottieni un indizio, e scopri chi ti ha pensato!' +
    '\n/dimenticami - Elimina le tue informazioni personali' +
    '\n/help - Mostra la lista dei comandi disponibili';

/* accept variables */
var isAccepted = false; //verifica se hai accettato i termini

/* comandi start e accetta: start non può essere ripetuto, NOTA: metti in ogni metodo il controllo su isAccepted */
function start_action(msg, telegramBot) {
    telegramBot.sendMessage(msg.chat.id, "Benvenuto! Questo bot ti permette di insultare o spottare una persona in anonimato! Le tue informazioni non verranno trasmesse ad anima viva! Accetta i termini e buon divertimento!\n /accetta - Accetta le condizioni di utilizzo del Bot Insulted Roma Tre");
}

commands.on('/start', function (msg, telegramBot) {
    (!this.isAccepted) && start_action(msg,telegramBot);
});

commands.on('/accetta', function (msg, telegramBot) {
    if (this.isAccepted) {
        telegramBot.sendMessage(msg.chat.id, "Hai già accettato! Ecco la lista delle cose che puoi chiedermi:\n\n" + listaComandi);
    }
    else {
        telegramBot.sendMessage(msg.chat.id, 'Grazie per aver accettato! Ecco la lista delle cose che puoi chiedermi:\n\n' + listaComandi);
        this.isAccepted = true;
    }
});

commands.on('/help', function (msg, telegramBot) {
    if (this.isAccepted) {
        telegramBot.sendMessage(msg.chat.id, 'Ecco la lista delle cose che puoi chiedermi:\n\n' + listaComandi);
    }
    else {
        start_action(msg, telegramBot);
    }
});


commands.on('/insulted', function (msg, telegramBot) {
    // var lastMessage = db.collection("sniff").find().sort({message_id:-1}).limit(1);
    // //console.log(db.collection("sniff"));
    // console.log(msg.message_id);
    var text_message;
    if(!this.isAccepted) {
        text_message = "Mi dispiace ma finchè non accetti i termini non posso ascoltarti, premi /help per saperne di più";
    }
    /* i comandi insulted e spotted possono essere fatti solo nel nostro gruppo ;) */
    if(msg.chat.id===CHAT_GROUP_ID) {
        if(msg.text==="/insulted") {
            text_message = "Il comando /insulted è costituito da: /insulted + messaggio, digita correttamente il comando e scrivi il tuo insulto!";
        }
        else 
            text_message = "Insulto #" + msg.message_id + "\n" + msg.text;
    }
    else {
        text_message = "il comando /insulted può essere usato nella chat di gruppo, entra nel gruppo: Insulted/Spotted Roma Tre! Acquisterai una vita e potrai usare questo comando e tanti altri!";
    }
    telegramBot.sendMessage(msg.chat.id, text_message);
});

commands.on('/claim', function (msg, telegramBot) {
    var text_message;
    var message_id;

    if (msg.text.indexOf("#") === 0){
        msg.text = msg.text.substring(1);
    }
    message_id = Number(msg.text);

    if (msg.chat.id !==  CHAT_GROUP_ID) {
        if (!isNaN(message_id)) {
            text_message = "Per sapere chi ha scritto il messaggio #" + message_id +" devi eseguire il comando /sendClaim seguito dal numero di cellulare su cui ti invieremo il nome della persona che ha scritto il messaggio #"+ message_id + "\n" +
                "Il messaggio è gratuito, nessun costo vi verrà addebitato.\n" +
                "Esempio: \n" +
                "/sendClaim 3351234567 #";
        }else{
            text_message = "Errore! Inserire un ID del messaggio valido!"
        }
    }else{
        text_message = "Solo in privato posso rivelarti chi ha scritto il messaggio";
    }

    telegramBot.sendMessage(msg.chat.id, text_message);

    /*if (isAccepted) {
        telegramBot.sendMessage(msg.chat.id, "Hai già accettato! Ecco la lista delle cose che puoi chiedermi:\n\n" + listaComandi);
    }
    else {
        telegramBot.sendMessage(msg.chat.id, 'Grazie per aver accettato! Ecco la lista delle cose che puoi chiedermi:\n\n' + listaComandi);
        isAccepted = true;
    } */
});

commands.on('/sendclaim', function (msg, telegramBot) {
    telegramBot.sendMessage(msg.chat.id, "funziona");
});

/*
commands.on('/aulelibere', function (msg, telegramBot) {
    var hideKeyboardOpts = {reply_markup: JSON.stringify({hide_keyboard: true})};
    var user = new User(msg.from.id, telegramBot);
    user.getDipartimento().then(function (dipartimentoId) {
        return orari.getAuleLibere(dipartimenti[dipartimentoId]);
    }).then(function (aule) {
        var message = '';
        if (aule.length == 0)
            return message = 'Scusa ma non sono riuscito a trovare aule libere nel tuo dipartimento.\n' +
                'Potrebbero non esserci aule libere in questo momento, oppure un problema sui server di Ateneo';

        message = 'Eccoti una lista delle aule libere (sperando non siano chiuse!):';
        aule.forEach(function (item) {
            message += '\n - ' + item.aula;
            if (item.date.getDate() == new Date().getDate())
                message += ' fino alle ' + moment(item.date).format('HH:mm');
            else
                message += ' fino alla chiusura';
        });
        return message;
    }).then(function (message) {
        telegramBot.sendMessage(msg.chat.id, message, hideKeyboardOpts);
    }).catch(function (err) {
        if (err instanceof errors.InputValidationError)
            telegramBot.sendMessage(msg.chat.id, err.message, hideKeyboardOpts);
        else
            handleError(err, msg, telegramBot);
    });
});
*/
/*
commands.on('/lezioni', function (msg, telegramBot) {
    telegramBot.sendMessage(msg.chat.id, 'Mi dispiace, ma gli scansafatiche del LUG Roma Tre ancora non mi hanno' +
        ' insegnato come scrivere le lezioni odierne!');
});
*/

commands.on('/dimenticami', function (msg, telegramBot) {
    var user = new User(msg.from.id, telegramBot);
    user.forget().then(function () {
        telegramBot.sendMessage(msg.chat.id, 'Ooh che mal di testa... Non mi ricordo più chi sei!')
    }).catch(function (err) {
        handleError(err, msg, telegramBot);
    });
});

commands.on('/cometichiami', function (msg, telegramBot) {
    telegramBot.sendMessage(msg.chat.id, 'Mi chiamo Spotted/Insulted Roma Tre Bot!');
});

commands.on('/grazie', function (msg, telegramBot) {
    telegramBot.sendMessage(msg.chat.id, 'Prego!');
});

// TODO Access this command only in debug mode
//commands.on('/debug', function (msg, telegramBot) {
//});

commands.on('/default', function (msg, telegramBot) {
    /* sul gruppo Insulted/Spotted Roma Tre il Bot non deve parlare troppo! */
    if (msg.chat.id !==  CHAT_GROUP_ID) {        
        var message = '';
        var rand = Math.floor(Math.random() * 5);
        switch (rand) {
            case 0:
                message = 'Mi dispiace ma non ho capito!';
                break;
            case 1:
                message = 'Hey, non sono mica così intelligente!';
                break;
            case 2:
                message = 'Ma tu non hai voglia di spottare qualcuno?';
                break;
            case 3:
                message = "\"Software is like sex: it's better when it's free.\" - Linus Torvalds";
                break;
            case 4:
                message = "Scusami... Ma non so proprio cosa dirti!";
                break;
        }
        message += '\n\nDigita /help per la lista dei comandi disponibili!';
        telegramBot.sendMessage(msg.chat.id, message);
    }
});