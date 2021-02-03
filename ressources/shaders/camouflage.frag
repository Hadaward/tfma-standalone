precision mediump float;

varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform sampler2D masque;
uniform vec2 decalageMasque1;
uniform vec2 decalageMasque2;
uniform vec2 echelleMasque1;
uniform vec2 echelleMasque2;
uniform vec4 couleur;

void main(void) {
	gl_FragColor = texture2D(uSampler, vTextureCoord)
		* texture2D(masque, echelleMasque1 * vTextureCoord + decalageMasque1)
		* texture2D(masque, echelleMasque2 * vTextureCoord + decalageMasque2)
		* couleur;
}

