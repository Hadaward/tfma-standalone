precision mediump float;

const vec3 codeSaturation = vec3(0.3, 0.59, 0.11);

varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform sampler2D textureDistorsion;
uniform sampler2D textureEcume;
uniform sampler2D textureLumiere;

uniform vec2 dimensions;
uniform vec2 decalage;
uniform float temps;
uniform float rapportEloignementFocale;
uniform vec2 rapportRenduFocale;
uniform vec2 rapportsFocaleTexture;
uniform float invSinAngleCamera;
uniform float cotanAngleCamera;

uniform vec4 couleurEau;
uniform vec4 vitesseEau;

void main(void) {
	vec2 focalePos = (vTextureCoord - 0.5) * rapportRenduFocale;
	float facteurAgrandissement = (1.0 + rapportEloignementFocale) / (1.0 - focalePos.y * cotanAngleCamera);

	vec2 posProjetee = rapportsFocaleTexture * focalePos * facteurAgrandissement;
	posProjetee.y *= invSinAngleCamera;
	posProjetee -= 0.5;
	posProjetee += decalage;

	vec2 pixelCible = vec2(posProjetee.x + ((temps*vitesseEau.x)/1000.0), posProjetee.y + ((temps*vitesseEau.y)/1000.0))*0.15;
	vec4 pixelDistorsion =  texture2D(textureDistorsion, pixelCible);

	pixelDistorsion -= 0.5;
	pixelDistorsion.xy *= 0.15;

	vec4 pixelEcume = texture2D(textureEcume, vec2(posProjetee.x + pixelDistorsion.x + ((temps*vitesseEau.z)/1000.0), posProjetee.y + pixelDistorsion.y + ((temps*vitesseEau.w)/1000.0)));
	vec4 pixelFond = texture2D(uSampler, vec2(vTextureCoord.x + pixelDistorsion.x, vTextureCoord.y + pixelDistorsion.y));

	// Lumière
	vec4 pixelLumiere = texture2D(textureLumiere, vec2(vTextureCoord.x + pixelDistorsion.x, vTextureCoord.y + pixelDistorsion.y));
	float rouge = pixelLumiere.r / 0.5;
	float vert = pixelLumiere.g / 0.5;
	float bleu = pixelLumiere.b / 0.5;

	// On applique une teinte bleue sombre au sol
	pixelFond.r *= couleurEau.r;
	pixelFond.g *= couleurEau.g;
	pixelFond.b *= couleurEau.b;

	gl_FragColor = vec4(pixelFond.r * rouge, pixelFond.g * vert, pixelFond.b * bleu, pixelFond.a) + pixelEcume*pixelFond.a*0.4;
}

