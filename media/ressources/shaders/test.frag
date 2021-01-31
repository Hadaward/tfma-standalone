precision mediump float;

varying vec2 vTextureCoord;
varying vec4 vColor;

uniform sampler2D uSampler;
uniform sampler2D texture;
uniform vec4 filterArea;
uniform vec2 dimensions;

void main(void) {
	vec2 uvs = vTextureCoord.xy ;
	vec4 pixelFond = texture2D(uSampler, vTextureCoord);

	vec2 pos = vec2(vTextureCoord) * filterArea.xy / dimensions;
	vec4 pixelTexture =  texture2D(texture, pos);

	float rouge = pixelTexture.r / 0.5;
	float vert = pixelTexture.g / 0.5;
	float bleu = pixelTexture.b / 0.5;

	vec4 couleurFin = vec4(pixelFond.r * rouge, pixelFond.g * vert, pixelFond.b * bleu, pixelFond.a);

	gl_FragColor = couleurFin;
}
