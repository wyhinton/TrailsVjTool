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
uniform float targetColorR;
uniform float targetColorG;
uniform float targetColorB;


float R(vec2 x){
    return fract(sin(dot(x,vec2(12.9898,78.233))) * 43758.5453);
}

float smoothwiggle(float t, float frequency, float seed)
{
    t *= frequency;
    float a = R(vec2(floor(t), seed)) * 2.0 - 1.0;
    float b = R(vec2(ceil(t), seed)) * 2.0 - 1.0;
    
    t -= floor(t);
    
    return mix(a, b, sin(t * t * 3.14159265 / 2.0)); // fake smooth blend
}
float test(float d){
    return 1.1;
}

void main() {

  vec2 uv = vTexCoord;
  // the texture is loaded upside down and backwards by default so lets flip it
  uv = 1.0 - uv;//   float z = test(1.)
  float wig2 = smoothwiggle(time*.01, .1, 1.4);
//   uv.x = smoothwiggle(time*.01, .1, 1.);
//   uv.x += smoothwiggle(time, .1, 1);
  // this line will make our uvs mirrored
  // it will convert it into a number that goes 0 to 1 to 0
  // abs() will turn our negative numbers positive
  vec2 mirrorUvs = abs(uv * 2.0  - 1.0);
// mirrorUvs.x += smoothwiggle(time*.01, wig2*.01, 1.);
   mirrorUvs.x += sin(time*.01)*.2*smoothwiggle(time*.01, .01, 1.);
//    mirrorUvs.x 
  vec2 finalUvs = uv;
  if (mirror){
    finalUvs = mirrorUvs;
  }
  vec4 tex = texture2D(tex0, finalUvs);

  //GREENSCREEN
//   const vec3 targetColor = vec3(0.0, 1.0, 0.0); // Find green
  const vec3 replace = vec3(0.0, 0.0, 0.0); // Replace with red
  
//   const float threshold = 0.5; // Controls targetColor color range
  const float softness = 0.3; // Controls linear falloff
  
  // Get difference to use for falloff if required
  float diff = distance(tex.rgb, vec3(targetColorR, targetColorG, targetColorB)) - threshold;
  
  // Apply linear falloff if needed, otherwise clamp
  float factor = clamp(diff / softness, 0.0, 1.0);
  
  vec4 keyed = vec4(mix(replace, tex.rgb, factor), tex.a);
  keyed.a = factor;
  // output to screen
//   gl_FragColor = tex;
  gl_FragColor = keyed;
//   gl_FragColor = vec4(targetColorR);
  //   gl_FragColor = vec4(factor);
}