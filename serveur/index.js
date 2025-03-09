const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const process = require('process');
const zlib = require('zlib');

// Ajouter mes variables d'environnement à celles éventuellement déjà déclarées.
// En effet, l'hébergeur peut utiliser process.env pour stocker des infos du serveur.
const env = require('./env');
env.chargerENVLocal();

// Déclarer le serveur et le port selon les éventuelles variables d'environnement du serveur.
// Si rien, alors le serveur est local.
const SERVEUR = process.env.HOST || process.env.LOCAL_HOST;
const PORT = process.env.PORT || process.env.LOCAL_PORT;

// Le referer dépend du serveur.
let refereur; 
if(SERVEUR === process.env.LOCAL_HOST)
{
	refereur = SERVEUR;
}
else
{
	refereur = process.env.DISTANT_HOST;
}

const DOSSIER_PUBLIC = path.join(__dirname, '../www');

const TYPES_MIME = 
{
	'.txt': 'text/plain',
	'.html': 'text/html',
	'.htm': 'text/html',
	'.js': 'text/javascript',
	'.css': 'text/css',
	
	'.png': 'image/png',
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.gif': 'image/gif',
	'.ico': 'image/x-icon',
	
	'.svg': 'image/svg+xml',
	
	'.ttf': 'font/ttf',
	'.otf': 'font/otf',
	'.woff': 'font/woff',
	'.woff2': 'font/woff2',
	'.eot': 'application/vnd.ms-fontobject',
	
	'.pdf': 'application/pdf',
	
	'.zip': 'application/zip',
};

const CONTENTTYPE_CHARSET = '; charset=utf-8';

const ENCODINGS = [
	{ nom: 'br', methodeRessource: zlib.brotliCompress, methodeTelechargement: zlib.createBrotliCompress },
	{ nom: 'gzip', methodeRessource: zlib.gzip, methodeTelechargement: zlib.createGzip },
	{ nom: 'deflate', methodeRessource: zlib.deflate, methodeTelechargement: zlib.createDeflate }
];

const fichiersNonCompressibles = ['.zip', '.rar', '.mp3', '.mp4', '.jpg', '.png', '.pdf', '.ico'];



const server = http.createServer((req, res) => 
{	
	tracerInformations(req);
	
	// CSP 
	res.setHeader('Content-Security-Policy', "default-src 'none'; script-src 'self'; img-src 'self' data:; style-src 'self'; font-src 'self'; base-uri 'self'; form-action 'self'; object-src 'self'; connect-src 'self'; frame-ancestors 'none'; child-src 'self';");
	
	// Eviter exploit sniffing par type MIME
	res.setHeader('X-Content-Type-Options', 'nosniff');
	
	// Bloquer les requêtes malveillantes par les navigateurs supportant cet en-tête
	// res.setHeader('X-XSS-Protection', '1; mode=block');
	// Déprécié
	
	// Le partage du contexte de navigation avec d'autres entités
	res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
	
	// Ne pas envoyer l'origine des requêtes aux autres
	res.setHeader('Referrer-Policy', 'same-origin');
	
	// Récupérer le referer, si existant
	const referer = req.headers['referer'];
	console.log(`Referer
	${referer}`);
	if(referer)
	{
		// console.log(`\tReferer : ${referer.includes(SERVEUR + ':' + PORT + '/')}`); // peut ne pas inclure le PORT
		console.log(`\tReferer : ${referer.includes(refereur)}`);
	}
	
	// Récupérer l'origin, si existant
	// const origin = req.headers['origin'];
	// console.log(`Origin :
	// ${origin}`);
	// Même logique que referer.
	
	// Récupérer la liste des encodages supportés
	const acceptEncoding = req.headers['accept-encoding'] || '';
		
	// Si le fichier demandé à est télécharger ou non. Par défaut, non.
	let fichierEstATelecharger = false;
	let nomFichierATelecharger;

	// Construire la route vers la ressource tout en limitant l'accès en dehors du dossier public
	let cheminDemande;
	if (req.url.match(/\.(html?|js|css|png|jpe?g|gif|svg|ico|eot|woff2?|otf|ttf|ttc|txt|pdf|zip)$/)) 
	{		
		// Si on demande une URL de fichier depuis la barre d'adresse du navigateur, alors c'est qu'on n'envoie pas de referer.
		// if(!referer || !referer.startsWith(`${SERVEUR}:${PORT}/`)) // peut ne pas inclure le PORT
		if(!referer || !referer.startsWith(refereur))
		{
			// Message html - erreur 403
			// res.writeHead(403, { 'Content-Type': 'text/html' });
			// res.end('<h1>Accès interdit à cette ressource.</h1>', 'utf-8');
			// Ou bien rediriger en accueil 
			redirigerEnAccueil(res);
			console.log('Pas de referer, donc redirection');
			return;
		}
		
		// Cache control
		// res.setHeader('Cache-Control', 'max-age=31536000, public, immutable');
		
		if(req.url === '/favicon.ico')
		{
			cheminDemande = path.join(__dirname, '../favicon.ico');
		}
		else
		{
			cheminDemande = path.join(DOSSIER_PUBLIC, req.url);
			
			if(req.url.startsWith('/telechargement'))
			{
				fichierEstATelecharger = true;
				// Conserver le nom du fichier
				const parsed = url.parse(req.url);
				// const baseName = path.basename(parsed.pathname); // séparateur du système d'exploitation
				const baseName = path.posix.basename(parsed.pathname); // utilise le séparateur '/'
				nomFichierATelecharger = baseName;
				console.log('L\'URL commence par /telechargement. ');
			}
		}
	} 
	else
	{
		// v.1 : avec gestion 404 sur page dédiée
		// cheminDemande = path.join(DOSSIER_PUBLIC, req.url);
		// v.2 : avec renvoi systématique vers l'accueil (le front gère les erreurs)
		cheminDemande = path.join(__dirname, 'html/index.html');
	}
	
	// L'extension de fichier
	const extension = String(path.extname(cheminDemande)).toLowerCase();
	
	// Déterminer le type MIME et le charset pour l'en-tête Content-Type
	const typeMime = TYPES_MIME[extension] || 'application/octet-stream';
	const contentTypeCharset = retournerContentType(typeMime);
	
	// La ressource est-elle à compresser ? Si oui, alors récupérer nom et méthodes.
	let fichierEstACompresser = false;
	let compressionChoisie;
	if(!fichiersNonCompressibles.includes(extension))
	{
		fichierEstACompresser = true;
		for(let el of ENCODINGS)
		{
			if(acceptEncoding.includes(el.nom))
			{
				compressionChoisie = el;
				break;
			}
		}
	}
	
	console.log(`Ressource à trouver et à renvoyer
	Chemin demandé : ${cheminDemande}
	typeMime : ${typeMime}
	ContentType : ${contentTypeCharset}
	Compresser ? ${fichierEstACompresser} ${compressionChoisie?compressionChoisie.nom:''}
	Télécharger ? ${fichierEstATelecharger}`);
	
	// Servir le fichier
	
	if(fichierEstATelecharger)
	{
		fs.stat(cheminDemande, (error, content) =>
		{
			console.log(`\nTéléchargement de ${cheminDemande} sans compression.`);
			if(error)
			{
				console.log(`Erreur : fichier introuvable à l'adresse ${cheminDemande}`);
				// renvoyerPageErreur(res, `${obtenirProtocole(req)}//${req.headers.host}${req.url}`);
				// Non car renvoie la page d'erreur en téléchargement si fichier introuvable 😄
				// v.2
				// retournerRessourcePersonnalisee(res, 404, TYPES_MIME['.txt'], 'Fichier introuvable');
				retournerMessage(res, 404, 'Fichier introuvable');
				return;
			}
			// Définir les en-têtes
			res.statusCode = 200;
			res.setHeader('Content-Type', contentTypeCharset);
			res.setHeader('Content-Disposition', `attachment; filename="${nomFichierATelecharger}"`);
			res.setHeader('Content-length', content.size);
			// V.1
			// Créer un flux de lecture pour le fichier et le transmettre au client
			const fileStream = fs.createReadStream(cheminDemande);
			fileStream.pipe(res);
			// V.2 
			// Créer un flux de lecture du fichier, selon la compression à appliquer, et le transmettre au client
			/*const fileStream = fs.createReadStream(cheminDemande);
			let compressionStream = null;
			if(fichierEstACompresser)
			{
				console.log(`\nFichier ${cheminDemande} à compresser avant téléchargement avec ${compressionChoisie.nom}.`);

				res.setHeader("Content-Encoding", compressionChoisie.nom);
				compressionStream = compressionChoisie.methodeTelechargement();
			}
			
			if(compressionStream)
			{
				fileStream.pipe(compressionStream).pipe(res);
			}
			else
			{
				fileStream.pipe(res);
			}*/
			// Problèmes : temps de traitement plus long ; les fichiers média ne sont pas à compresser car ils le sont déjà ; donc rester en V.1.
		});
		return;
	}
	
	// Si le fichier n'est pas à télécharger, alors le lire et envoyer le contenu comme réponse
	fs.readFile(cheminDemande, (error, content) => 
	{
		if (error)
		{
			if (error.code === 'ENOENT') // fichier non trouvé
			{
				console.log(`\nEnvoi de ${cheminDemande}. Erreur : fichier introuvable`);
				retournerMessage(res, 404, '404 - Ressource introuvable');
			}
			else // Tout autre cas d'erreur
			{
				console.log(`\nEnvoi de ${cheminDemande}. Erreur 500 Internal Server Error. Message : ${error.message}`);
				retournerMessage(res, 500, `500 - ${error.code}`);
			}
			return;
		}
	
		// Envoyer le contenu du fichier avec le type MIME correct et avec compression éventuelle
		if(fichierEstACompresser)
		{
			compressionChoisie.methodeRessource(content, (err, compressed) => 
			{
				let contenuFinal;
				if(err)
				{
					console.log(`\nEnvoi de ${cheminDemande}. Erreur de compression ${compressionChoisie.nom}. Renvoi de la ressource non compressée. ${err}`);
					contenuFinal = content;
				}
				else
				{
					console.log(`\nEnvoi de ${cheminDemande}. Compression ${compressionChoisie.nom}`);
					res.setHeader("Content-Encoding", compressionChoisie.nom);
					contenuFinal = compressed;
				}
				retournerRessource(res, 200, contentTypeCharset, contenuFinal);
			});
		}
		else
		{
			console.log(`\nEnvoi de ${cheminDemande} sans compression`);
			retournerRessource(res, 200, contentTypeCharset, content);
		}
	});
});

// Démarrer le serveur sur le port 
server.listen(PORT, () => 
{
	const message = `Serveur démarré sur ${SERVEUR}:${PORT}`;
	const messageLongueur = message.length;
	console.log('-'.repeat(messageLongueur));
	console.log(message);
	console.log('-'.repeat(messageLongueur));
});




let tracerInformations = (req) =>
{
	console.log('');
	
	// console.log('Headers :', JSON.stringify(req.headers, null, 2));
	// console.log('\tHost : ' + req.headers.host); //  Host : localhost:3000
	console.log(`Requête entrante
	Méthode et URL : ${req.method} ${req.url}
	Adresse IP : ${req.socket.remoteAddress}
	Adresse IP si Proxy : ${req.headers['x-forwarded-for']}
	User agent: ${req.headers['user-agent']}
	acceptEncoding = ${req.headers['accept-encoding']}`); 
	// socket = connexion TCP, remoteAddress = adresse IP de l'utilisateur ayant fait la requête
	// Adresse IPv4, par exemple 192.168.0.1
	// Adresse IPv6, par exemple ::1 (localhost en IPv6).
}

let redirigerEnAccueil = (res) =>
{
	// 302 Found : Permet de rediriger mais peut entraîner un changement de méthode (ex : une requête POST redirigée pourrait devenir une GET).
	// 307 Temporary Redirect : Garantit que la méthode HTTP initiale (ex : POST) reste la même après la redirection.
	res.statusCode = 307;
	res.setHeader('Location', '/');
	res.end();
}

let retournerContentType = (typeMime) =>
{
	let charset = '';
	switch (typeMime) 
	{
		case TYPES_MIME['.png']:
		case TYPES_MIME['.jpg']:
		case TYPES_MIME['.jpeg']:
		case TYPES_MIME['.gif']:
		case TYPES_MIME['.ico']:
			break;
		default:
			charset = CONTENTTYPE_CHARSET;
			break;
	}
	return `${typeMime}${charset}`;	
}

/*let retournerRessourcePersonnalisee = (res, statusCode, typeMime, message) =>
{
	// v.1
	// res.writeHead(statusCode, { 'Content-Type': typeMime });
	// res.end(message, 'utf-8');
	// v.2
	res.statusCode = statusCode;
	let contentType = retournerContentType(typeMime);
	res.setHeader('Content-Type', contentType);
	res.end(message);
}*/
// Exemple d'utilisation : retournerRessourcePersonnalisee(res, 404, TYPES_MIME['.txt'], 'Fichier introuvable');

let retournerMessage = (res, statusCode, message) =>
{
	res.statusCode = statusCode;
	res.setHeader('Content-Type',  TYPES_MIME['.txt'] + CONTENTTYPE_CHARSET);
	res.end(message);		
}

let retournerRessource = (res, statusCode, contentTypeCharset, message) =>
{
	res.statusCode = statusCode;
	res.setHeader('Content-Type', contentTypeCharset);
	res.end(message);
}

/*let renvoyerPageErreur = (res, cheminDemande) =>
{
	const cheminErreur = path.join(__dirname, 'html/erreur.html');
	
	// Préciser l'encodage
	fs.readFile(cheminErreur, 'utf-8', (err404, contenuErreur) => 
	{
		if (err404) 
		{
			// Si le fichier d'erreur lui-même est introuvable
			retournerRessource(res, 500, TYPES_MIME['.html'], '<h1>Erreur 500 - Impossible de charger la page d\'erreur 404</h1>');
			return;
		} 
	
		// Afficher la page d'erreur 
		// v.1 : telle quelle
		// res.writeHead(res.statusCode, { 'Content-Type': mimeTypes['.html'] });
		// res.end(contenuErreur);
		// v.2 : avec contenu spécifique
		const contenuPersonnalise = contenuErreur
			.replace('{{errorCode}}', res.statusCode)
			.replace('{{errorMessage}}', `Le fichier ${cheminDemande} est introuvable.`);
		retournerRessource(res, res.statusCode, TYPES_MIME['.html'], contenuPersonnalise);
	});
}*/

/*let obtenirProtocole = (req) =>
{
	return req.connection.encrypted ? 'https' : 'http';
}*/

