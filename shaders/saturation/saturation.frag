precision mediump float;

// lets grab texcoords from the vertex shader
varying vec2 vTexCoord;

// our texture coming from p5
uniform sampler2D tex0;
uniform float threshold;
uniform float replace;
uniform vec3 targetColor;
uniform float softness;
uniform float time;
uniform bool mirror;
uniform bool useMic;
uniform float targetColorR;
uniform float targetColorG;
uniform float targetColorB;
uniform float micInput;
uniform float jitterAmount;
uniform bool useMicOpacity;
uniform bool ripple;
uniform float rippleScale;
uniform bool warp;
uniform bool fractal;
uniform bool threshFromMic;

uniform bool rotate; 
const int numPoints = 12;
const bool showFolds = false;

float rand( vec2 n ) {
	return fract(sin(dot(n.xy, vec2(12.9898, 78.233)))* 43758.5453);
}

struct Ray
{
	vec2 point;
	vec2 direction;
};

float noise(vec2 n) {
	const vec2 d = vec2(0.0, 1.0);
	vec2 b = floor(n), f = smoothstep(vec2(0.0), vec2(1.0), fract(n));
	return mix(mix(rand(b), rand(b + d.yx), f.x), mix(rand(b + d.xy), rand(b + d.yy), f.x), f.y);
}

vec2 noise2(vec2 n)
{
	return vec2(noise(vec2(n.x+0.2, n.y-0.6)), noise(vec2(n.y+3., n.x-4.)));
}

Ray GetRay(float i, float timeIn)
{
	vec2 position = noise2(vec2(i*6.12+timeIn*0.1, i*4.43+timeIn*0.1));
	return Ray(
		position,
		normalize(noise2(vec2(i*7.+timeIn*0.05, i*6.))*2.0-1.0));	
}


float R(vec2 x){
    return fract(sin(dot(x,vec2(12.9898,78.233))) * 43758.5453);
}

vec2 random2(float seed)
{
    float rand1 = fract(sin(seed) * 43758.5453123);
    float rand2 = fract(cos(seed) * 23421.631235);
    
    return vec2(rand1, rand2) * 2.0 - 1.0;
}

float smoothwiggle(float t, float frequency, float seed)
{
    t *= frequency;
    float a = R(vec2(floor(t), seed)) * 2.0 - 1.0;
    float b = R(vec2(ceil(t), seed)) * 2.0 - 1.0;
    
    t -= floor(t);
    
    return mix(a, b, sin(t * t * 3.14159265 / 2.0)); // fake smooth blend
}

vec2 warpuv(vec2 inUv){

      float mult = .01;
      float tMult = time*mult;
            float freq = 3.0*sin(mult*time);
    vec2 warp = 0.5000*cos( inUv.xy*1.0*freq + vec2(0.0,1.0) + tMult) +
                0.2500*cos( inUv.yx*2.3*freq + vec2(1.0,2.0) + tMult) +
                0.1250*cos( inUv.xy*4.1*freq + vec2(5.0,3.0) + tMult ) +
                0.0625*cos( inUv.yx*7.9*freq + vec2(3.0,4.0) + tMult );
    vec2 st = inUv + warp;
    return st;
}
// 

void main() {

  vec2 uv = vTexCoord;

  // the texture is loaded upside down and backwards by default so lets flip it
  uv = 1.0 - uv;//   float z = test(1.)
      // distance of current pixel from center
  if (ripple){
	float cLength = length(uv);

	uv += (uv/cLength)*cos(uv*12.0-time*.01+rippleScale) * rippleScale;
	
  }

    float angle = time*.01;
  float cosAngle = cos(angle);
  float sinAngle = sin(angle);
  vec2 rotatedUV = vec2(uv.x * cosAngle - uv.y * sinAngle,
                        uv.x * sinAngle + uv.y * cosAngle);
  if (rotate){
  uv += rotatedUV;
  }

  vec2 curPos = uv;
  vec3 fragColor = vec3(0.);
	for(int i=0;i<numPoints;i++)
	{
		Ray ray=GetRay(float(i+1)*3., time*.01);	
			
		if(length(ray.point-curPos)<0.01 && showFolds)
		{
			fragColor.rgb = vec3(1,1,1);
			return;
		}
		else if (length(curPos-(ray.point+ray.direction*0.1))<0.01 && showFolds)
		{
			fragColor.rgb = vec3(1,0,0);
			return;
		}
		else
		{
			float offset=dot(curPos-ray.point, ray.direction);
			if(abs(offset)<0.001 && showFolds)
			{
				fragColor.rgb = vec3(0,0,1);
				return;
			}
			if(offset<0.)
			{
				curPos -= ray.direction*offset*2.0;
			}									
		}
	}
  if (fractal){
	uv *= vec2(curPos.x,curPos.y);
  }

  // abs() will turn our negative numbers positive
  
  float multAmount = .001;
  // if (uv.y <  sin(time*multAmount)){
  // }else {
  //       // uv.y-= sin(time*.01);
  // }
  // uv.y += abs(sin(time*.01))*.5;

    
    // vec3 col = texture(iChannel0,uv).xyz;
  float wig2 = smoothwiggle(time*.01, .1, 1.4);
  vec2 mirrorUvs = abs(uv * 2.0  - 1.0);
// mirrorUvs.x += smoothwiggle(time*.01, wig2*.01, 1.);
   mirrorUvs.x += sin(time*.01)*.2*smoothwiggle(time*.01, .01, 1.);
//    mirrorUvs.x 
  vec2 finalUvs = uv;
  if (mirror){
    finalUvs = mirrorUvs;
  }

      vec2 pos_rnd_1 = random2(floor(time));
         pos_rnd_1 = pow(pos_rnd_1, vec2(3.0));
    vec2 pos_rnd_2 = random2(floor(time) + 1.0);
         pos_rnd_2 = pow(pos_rnd_2, vec2(3.0));
    vec2 pos_rnd = mix(pos_rnd_1, pos_rnd_2, fract(time));
  // finalUvs = mix(pos_rnd, finalUvs, .1);
  // if (jitter){

  // }
  finalUvs += pos_rnd * micInput * jitterAmount;
  if (warp){
    finalUvs = warpuv(finalUvs);
  }

  // finalUvs = mix(pos_rnd, finalUvs, vec2(sin(time)));
  vec4 tex = texture2D(tex0, finalUvs);

  //GREENSCREEN 
//   const vec3 targetColor = vec3(0.0, 1.0, 0.0); // Find green
  const vec3 replace = vec3(0.0, 0.0, 0.0); // Replace with red
  
//   const float threshold = 0.5; // Controls targetColor color range
  const float softness = 0.3; // Controls linear falloff
  
  // Get difference to use for falloff if required
  // float rFx = targetColorR * sin(time*.01);
  float rFx = targetColorR;
  float threshFx = threshold; 
  if (threshFromMic){
    threshFx = threshold+micInput;
  }
  float diff = distance(tex.rgb, vec3(rFx, targetColorG, targetColorB)) - threshFx;
  
  // Apply linear falloff if needed, otherwise clamp
  float factor = clamp(diff / softness, 0.0, 1.0);
  
  vec4 keyed = vec4(mix(replace, tex.rgb, factor), tex.a);
  keyed.a = factor;
  // output to screen
//   gl_FragColor = tex;
  if (useMicOpacity){
     keyed *= micInput;
  }

  // float lum = length(keyed);  
  // keyed -= lum*sin(time*.01);
  vec4 brighter = keyed * 1.5;
  if (length(keyed)>2.){
    keyed = vec4(1.);
  // keyed = mix(keyed, brighter, sin(time*.01));
  }
  float distance = keyed.g - max( keyed.r, keyed.b );
  if (distance > 0.05) discard;

  // vec4 invertedColor = vec4(1.0 - keyed.rgb, keyed.a);
  // keyed = mix(invertedColor, keyed, sin(time*.01));
  gl_FragColor = keyed;
//   gl_FragColor = vec4(targetColorR);
  //   gl_FragColor = vec4(factor);
}