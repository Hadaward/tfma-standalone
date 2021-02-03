precision mediump float;

varying vec2 vTextureCoord;
varying vec4 vColor;
const vec3 codeSaturation = vec3(0.3, 0.59, 0.11);

uniform sampler2D uSampler;
uniform sampler2D texture;
uniform vec4 filterArea;
uniform vec2 dimensions;
uniform bool vignette;
uniform float rayonVignette;
uniform float rayonVignette2;
uniform float alphaVignette;
uniform vec3 lumiereMonde;

void main(void) {
	vec2 uvs = vTextureCoord.xy ;
	vec4 pixelFond = texture2D(uSampler, vTextureCoord);

	vec2 pos = vTextureCoord * filterArea.xy / dimensions;
	vec4 pixelTexture =  texture2D(texture, pos);

//	vec2 position = (gl_FragCoord.xy / resolution.xy) - vec2(0.5);
	if (vignette) {
		vec2 position = pos - vec2(0.5);
		//position.y += decVignette*0.0;
		float len = length(position);
		float vignette = smoothstep(rayonVignette, rayonVignette-rayonVignette2, len);

		// Désaturation vignette
		vec3 gray = vec3(dot(codeSaturation, pixelFond.rgb));
		float valeurSaturation = smoothstep(1.0, 0.3, len*1.0);
		pixelFond.rgb = mix(pixelFond.rgb, gray, min(1.0 - valeurSaturation, 1.0));

		// Vignettage
		pixelFond.rgb = mix(pixelFond.rgb, pixelFond.rgb * vignette, alphaVignette);
	}

	pixelTexture *= 2.0;

	// Désaturation
//	vec3 grayXfer = vec3(0.3, 0.59, 0.11);
//	vec3 gray = vec3(dot(grayXfer, pixelFond.rgb));
//	pixelFond.rgb = mix(pixelFond.rgb, gray, 0.1);

	vec4 couleurFin;
	couleurFin.rgb = pixelFond.rgb * pixelTexture.rgb;
	couleurFin.a =  pixelFond.a;

	vec3 couleurGlobale = mix(
		1.0 - (1.0 - 2.0 * lumiereMonde) * (1.0 - abs(1.0-pixelTexture.rgb)),
		(2.0 * lumiereMonde - 1.0) * (1.0 - abs(1.0-pixelTexture.rgb)) + 1.0,
		step(lumiereMonde, vec3(0.5)));

	couleurFin.rgb = couleurFin.rgb * couleurGlobale;

//	vec2 cPos = -1.0 + 2.0 * gl_FragCoord.xy / dimensions.xy;
//	float cLength = length(cPos);
//
//	vec2 uv = gl_FragCoord.xy/dimensions.xy+(cPos/cLength)*cos(cLength*12.0-temps*4.0)*0.03;
//	vec3 col = texture2D(uSampler,uv).xyz;
//
//	gl_FragColor = vec4(col,1.0);

	gl_FragColor = couleurFin;
}


//	vec2 cPos = -1.0 + 2.0 * gl_FragCoord.xy / resolution.xy;
//	float cLength = length(cPos);
//
//	vec2 uv = gl_FragCoord.xy/resolution.xy+(cPos/cLength)*cos(cLength*12.0-time*4.0)*0.03;
//	vec3 col = texture2D(tex,uv).xyz;
//
//	gl_FragColor = vec4(col,1.0);
