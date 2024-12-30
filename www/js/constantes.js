// nom : nom du Web Component représentant une page du site
// chemin : chemin vers le fichier JS. Doit commencer par un '/'
// route : route choisie pour cette page. Doit commencer par un '/'

export const PAGES = 
{
	accueil: 
	{
		nom: 'page-accueil',
		chemin: '/accueil.js',
		route: '/',
	},
	erreur:
	{
		nom: 'page-erreur',	
		chemin: '/erreur.js',
		route: '/erreur',
	},
	rubrique:
	{
		nom: 'page-rubrique',	
		chemin: '/rubrique.js',
		route: '/rubrique',
	},
	sousRubrique:
	{
		nom: 'page-sousrubrique',	
		chemin: '/rubrique/sousRubrique.js',
		route: '/rubrique/sous_rubrique',
	},
	alerte:
	{
		nom: 'page-alerte',	
		chemin: '/alerte.js',
		route: '/alerte',
	},
	analyseURL:
	{
		nom: 'page-analyseurl',	
		chemin: '/analyseUrl.js',
		route: '/analyse-url',
	},
};
