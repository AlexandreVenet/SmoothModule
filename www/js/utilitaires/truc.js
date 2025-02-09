class Truc extends HTMLElement
{
	constructor()
	{
		super(); // Toujours appeler le constructeur parent
		
		this.creerElement();
	}
	
	creerElement = () =>
	{
		// Création de la racine du shadow DOM
		// 'open' : composant modifiable après ajout
		// 'closed' : composant non modifiable 
		const shadow = this.attachShadow({mode: 'closed'});
		
		const template = document.createElement('template');
		template.innerHTML = `
		<link rel="stylesheet" href="/css/truc.css">
		<div class="truc">😎</div>
		`;
		shadow.appendChild(template.content.cloneNode(true));
	}
	
	connectedCallback()
	{
		console.log(`[${this.constructor.name}] Elément connecté au DOM du document.`);
	}
	
	disconnectedCallback()
	{
		console.log(`[${this.constructor.name}] Elément déconnecté du DOM du document.`);
	}
	
	adoptedCallback()
	{
		console.log(`[${this.constructor.name}] Elément déplacé vers un document.`);
	}
	
	attributeChangedCallback()
	{
		console.log(`[${this.constructor.name}] Un attribut a été ajouté, supprimé ou modifié.`);
	}
}

export default Truc;
