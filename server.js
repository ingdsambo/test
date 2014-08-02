var express 		= require('express'),
	app 			= express(),
    swig 			= require('swig'),
	server 			= require('http').createServer(app),
    io 				= require("socket.io").listen(server),
    request 		= require('request'),
    http			= require('http');

server.listen(8081);

// Configuracion para renderizar vistas
app.engine('html', swig.renderFile);
app.set('view engine','html');
app.set('views', __dirname + '/app/views/');

// Carga de archivos estaticos
app.use(express.static('./public'));

// Agregamos post, cookie y sessiones
app.configure(function() {
	app.use(express.logger());
	app.use(express.cookieParser());
	app.use(express.bodyParser());
	app.use(express.methodOverride());

	app.use(express.session({
		secret  : 'sdfsdSDFD5sf4rt4egrt4drgsdFSD4e5',
    	//cookie  : { maxAge  : new Date(Date.now() + 10000) }
	}));
});

var isntLoggedIn = function (req, res, next) {
	if(!req.session.user){		
		res.redirect('/');
		return;
	}

	next();
};

var inLoggedIn = function (req, res, next) {
	if(req.session.user){
		res.redirect('/recetario');
		return;
	}	

	next();
};

app.get('/', function (req, res) {
	res.render('home');
});

// Abrimos los sokects

io.sockets.on('connection', function (socket){

	socket.on('recetario.get.edit', function (data){
		var str = '';
		var options = {
				hostname: apiserver,
				port: apiport,
				path: '/recetas/detail/?uid='+ data.uid +'&rid=' + data.rid,
				method: 'GET',
				headers: { 'Content-Type': 'application/json' },
				auth: apisecretauth,
		};

		callback = function(response) {
			response.on('data', function (chunk) {
				str += chunk;
			});

			response.on('end', function () {	
				var list_recetas = JSON.parse(str);
				io.sockets.emit(data.callback, {receta: list_recetas});
			});
		}

		http.request(options, callback).end();

	});
});