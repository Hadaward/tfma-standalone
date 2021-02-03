precision mediump float;

varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform sampler2D masque;
uniform vec2 decalageMasque;
uniform vec2 echelleMasque;
uniform float progression;

void main(void) {
	gl_FragColor = texture2D(uSampler, vTextureCoord) * mix(1.0, texture2D(masque, echelleMasque * vTextureCoord + decalageMasque).a, progression);
}

