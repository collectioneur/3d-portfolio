#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 fragColor;

// Функция для создания шума Перлина
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
             -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
        + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy),
        dot(x12.zw, x12.zw)), 0.0);
    m = m*m;
    m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
}

// Функция для создания звезд
float starField(vec2 uv) {
    float stars = 0.0;
    for(int i = 0; i < 3; i++) {
        vec2 q = uv * (2.0 + float(i));
        vec2 id = floor(q);
        vec2 r = fract(q);
        float c = random(id);
        stars += step(0.95, c) * smoothstep(0.0, 0.1, length(r - 0.5));
    }
    return stars;
}

// Функция для создания Млечного пути
float milkyWay(vec2 uv) {
    float angle = atan(uv.y - 0.5, uv.x - 0.5);
    float dist = length(uv - 0.5);
    
    // Создаем основную структуру Млечного пути
    float base = smoothstep(0.2, 0.0, abs(angle - 3.14159));
    float width = smoothstep(0.5, 0.0, dist);
    
    // Добавляем шум для создания более реалистичной текстуры
    float noise = snoise(uv * 10.0) * 0.5 + 0.5;
    
    return base * width * noise * 0.5;
}

void main() {
    vec2 uv = v_uv;
    
    // Базовый цвет неба
    vec3 skyColor = vec3(0.02, 0.02, 0.08);
    
    // Добавляем звезды
    float stars = starField(uv);
    
    // Добавляем Млечный путь
    float milky = milkyWay(uv);
    
    // Смешиваем все компоненты
    vec3 finalColor = skyColor + vec3(stars) + vec3(milky);
    
    // Добавляем легкое свечение
    finalColor += vec3(0.1, 0.1, 0.2) * milky;
    
    fragColor = vec4(finalColor, 1.0);
} 