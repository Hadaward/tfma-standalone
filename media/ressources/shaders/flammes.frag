precision mediump float;

uniform vec2 dimensions;
uniform float iTime;
uniform sampler2D uSampler;
varying vec2 vTextureCoord;
uniform vec4 filterArea;

float rand(vec2 n) {
	return fract(sin(cos(dot(n, vec2(12.9898,12.1414)))) * 83758.5453);
}

float noise(vec2 n) {
	const vec2 d = vec2(0.0, 1.0);
	vec2 b = floor(n), f = smoothstep(vec2(0.0), vec2(1.0), fract(n));
	return mix(mix(rand(b), rand(b + d.yx), f.x), mix(rand(b + d.xy), rand(b + d.yy), f.x), f.y);
}

float fbm(vec2 n) {
	float total = 0.0, amplitude = 1.0;
	for (int i = 0; i <5; i++) {
		total += noise(n) * amplitude;
		n += n*1.7;
		amplitude *= 0.47;
	}
	return total;
}

vec3 rgb2hsv(vec3 c) {
	vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
	vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
	vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

	float d = q.x - min(q.w, q.y);
	float e = 1.0e-10;
	return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

vec3 hsv2rgb(vec3 c) {
	vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
	vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
	return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

float expStep( float x, float k, float n ) {
    return exp( -k*pow(x,n) );
}

float cubicPulse( float c, float w, float x ) {
    x = abs(x - c);
    if( x>w ) return 0.0;
    x /= w;
    return expStep(1.95 * x, 1.5, 2.);
}


void main() {
	vec2 pixelCoord = vTextureCoord * filterArea.xy;
	vec2 normalizedCoord = pixelCoord / dimensions;

	vec2 coord = pixelCoord;
	// On s'assure que la base des flammes corresponde à la ligne des récompenses
	coord.y -=dimensions.y / 2.;

	vec2 uv = coord / dimensions;

	float dist = 5.5-sin(iTime*0.4)/1.89;
	vec2 p = coord * dist / dimensions.xx;

	// On réduit les flammes à une bande centrale
	float hauteurBande = 4.;
	float e = 0.05;
     	p.y =(hauteurBande * (smoothstep(0.5 - e, 0.5 + e, normalizedCoord.y)-0.5)) * p.y;

	p += sin(p.yx*40.0+vec2(2.,-.3)*iTime)*0.01;
	p += sin(p.yx*8.0+vec2(.6,+.1)*iTime)*0.005;

	// On fait en sorte que les flammes du haut et du bas ne soient pas symétriques
	if (normalizedCoord.y > 0.5) {
		p.x = 2.5-p.x;
	}

	float mult = 1.5;
	float speed = 3.;
	float q = fbm(p - iTime * 0.3);
	vec2 r = vec2(0., fbm(p + q - iTime * speed)) * mult;
	vec3 color=vec3(3.0,.2,.05)/(pow((r.y+r.y)* max(.0,p.y)+0.1, 1.5));;
    	color = color/(1.0+max(vec3(0),color));

	// On change la couleur des extrémités
	float hueCible = 39.; // Doré
	float hueOrigine = 15.; // Rouge
	float decalage = (hueCible - hueOrigine) / 360.;
	vec3 colorHSV = rgb2hsv(color);
	colorHSV.x += decalage;

	// Dégradé blanc -> couleur du centre vers les extrémités
	float degradeCentral = (1. - 2. * abs(smoothstep(0.35, 0.65, normalizedCoord.y) - 0.5));
	colorHSV.y -= degradeCentral *  0.3;
	colorHSV.z += degradeCentral *  0.3;
	color = hsv2rgb(colorHSV);


	float alpha = 1.;

	// Masque
	float hauteurMasque = 0.5;
	float epaisseurExtremites = 0.095;
	float distanceAxeOrdonnee = abs(normalizedCoord.y - 0.5);
	float cp = cubicPulse(0.5, 0.5, normalizedCoord.x) * hauteurMasque - epaisseurExtremites;
	float largeurDegradeMasque = 0.1;
	if (distanceAxeOrdonnee > cp + largeurDegradeMasque) {
		color.rgb = vec3(0.,0.,0.);
		alpha = 0.0;
	} else {
		alpha =  smoothstep(cp + largeurDegradeMasque, cp, distanceAxeOrdonnee);
	}

	// Transparence progressive lorsque la fumée est trop foncée
	float limiteValeurCouleur = 0.8;
	if (colorHSV.z < limiteValeurCouleur) {
		float alphaDegressif = smoothstep(0.55, limiteValeurCouleur, colorHSV.z) * 1.;
		alpha *= alphaDegressif;
	}

	// Alpha ligne centrale
	float ssCentral =  1. - 2. * abs(smoothstep(0.49, 0.51,  normalizedCoord.y) - 0.5);
	if (ssCentral > 0.) {
		alpha *= (1.0 + ssCentral * 0.5);
	}

	// Alpha global
	alpha *= 0.1 + (1. - 2. * abs(smoothstep(0.3,0.7, normalizedCoord.y) - 0.5)) * 0.9;

	gl_FragColor = vec4(color.rgb * alpha, alpha);
}