# Módulo de Partículas (particles-test.js)

Sistema de partículas GPU-accelerado usando `THREE.Points` + `ShaderMaterial` para renderização de alto desempenho.

## 🎯 Visão Geral

Este módulo implementa um sistema de partículas capaz de renderizar **até 200.000 partículas** com animação 100% GPU-side, garantindo performance consistente de 60fps.

### Características Principais

- **1 draw call** para todas as partículas
- **Animação GPU-side** via vertex shader (zero CPU overhead por frame)
- **Blending aditivo** para visual "glow"
- **Soft circles** via fragment shader com descarte por distância
- **Múltiplos padrões** de distribuição (random, sphere, galaxy, torus, fountain)
- **Múltiplos modos de cor** (rainbow, monochrome, temperature, fire)
- **Controles em tempo real** via UI

## 🏗️ Arquitetura

### Componentes

```
particles-test.js
├── PARTICLE_CONFIG (constantes)
│   ├── DEFAULT_COUNT: 50000
│   ├── AREA_SIZE: 20
│   ├── PARTICLE_SIZE_RANGE: [1, 4]
│   └── COLOR_PALETTES (rainbow, monochrome, temperature, fire)
│
├── createParticleGeometry(count, pattern)
│   ├── BufferGeometry com custom attributes
│   ├── aPosition (vec3)
│   ├── aVelocity (vec3)
│   ├── aColor (vec3)
│   ├── aSize (float)
│   └── aLife (float)
│
├── createParticleMaterial()
│   ├── ShaderMaterial
│   ├── uniforms: { uTime, uPixelRatio, uSizeMultiplier, uSpeedMultiplier }
│   ├── vertexShader: animação procedural + size attenuation
│   └── fragmentShader: soft circle + alpha blending
│
├── createParticleSystem(scene)
│   ├── THREE.Points(geometry, material)
│   ├── frustumCulled: false
│   └── additive blending
│
└── API pública:
    ├── init(rendererData)
    ├── update(deltaTime)
    ├── dispose()
    ├── setCount(count)
    ├── setColorMode(mode)
    ├── setPattern(pattern)
    ├── setSpeedMultiplier(multiplier)
    └── setSizeMultiplier(multiplier)
```

### Shaders

#### Vertex Shader
Responsável pela animação procedural das partículas:
- Posição base + velocidade × tempo + oscilação sinusoidal
- Size attenuation baseado na distância da câmera
- Fade in/out baseado no ciclo de vida

#### Fragment Shader
Responsável pela aparência visual:
- Círculos suaves via cálculo de distância do centro
- Descarte de fragmentos fora do raio
- Alpha blending para transparência suave

## 🎨 Padrões de Distribuição

### `random`
Distribuição aleatória em um cubo de dimensão `AREA_SIZE`.

### `sphere`
Partículas distribuídas na superfície de uma esfera.

### `galaxy`
Espiral com 4 braços, simulando uma galáxia.

### `torus`
Partículas distribuídas em formato de toro (donut).

### `fountain`
Emissão de baixo para cima com simulação de gravidade.

## 🌈 Modos de Cor

### `rainbow`
Arco-íris completo baseado no índice da partícula.

### `monochrome`
Cor única (azul padrão).

### `temperature`
Gradiente de temperatura (azul frio → vermelho quente).

### `fire`
Tons de fogo (vermelho → laranja → amarelo).

## 📡 API

### `init(rendererData)`
Inicializa o sistema de partículas.

**Parâmetros:**
- `rendererData.scene` - Cena Three.js onde as partículas serão adicionadas
- `rendererData.renderer` - Renderer Three.js (para obter pixelRatio)

**Retorna:** `void`

---

### `update(deltaTime)`
Atualiza a animação das partículas (chamado automaticamente via `renderer.onUpdate`).

**Parâmetros:**
- `deltaTime` - Tempo decorrido desde o último frame (segundos)

**Retorna:** `void`

---

### `dispose()`
Limpa recursos e remove as partículas da cena.

**Retorna:** `void`

---

### `setCount(count)`
Altera o número de partículas em tempo real.

**Parâmetros:**
- `count` - Número de partículas (1.000 a 200.000)

**Retorna:** `void`

**Nota:** Reconstrói a geometria interna.

---

### `setColorMode(mode)`
Altera o modo de cor das partículas.

**Parâmetros:**
- `mode` - Um dos valores: `'rainbow'`, `'monochrome'`, `'temperature'`, `'fire'`

**Retorna:** `void`

**Nota:** Reconstrói a geometria interna.

---

### `setPattern(pattern)`
Altera o padrão de distribuição das partículas.

**Parâmetros:**
- `pattern` - Um dos valores: `'random'`, `'sphere'`, `'galaxy'`, `'torus'`, `'fountain'`

**Retorna:** `void`

**Nota:** Reconstrói a geometria interna.

---

### `setSpeedMultiplier(multiplier)`
Altera a velocidade da animação.

**Parâmetros:**
- `multiplier` - Multiplicador de velocidade (0 a 5, padrão: 1)

**Retorna:** `void`

---

### `setSizeMultiplier(multiplier)`
Altera o tamanho das partículas.

**Parâmetros:**
- `multiplier` - Multiplicador de tamanho (0.1 a 3, padrão: 1)

**Retorna:** `void`

## 🎮 Uso

### Via UI
Clique no botão **"✨ Particles"** na seção "Rendering" do painel de testes para ativar/desativar o sistema.

### Programaticamente

```javascript
import * as particlesTest from './modules/particles-test.js';

// Inicializar
particlesTest.init({ scene, renderer });

// Alterar configurações
particlesTest.setCount(100000);
particlesTest.setPattern('galaxy');
particlesTest.setColorMode('rainbow');
particlesTest.setSpeedMultiplier(2);
particlesTest.setSizeMultiplier(1.5);

// Limpar
particlesTest.dispose();
```

## ⚙️ Performance

### Métricas

| Configuração | Partículas | FPS | Draw Calls | VRAM |
|---|---|---|---|---|
| Padrão | 50.000 | 60 | 1 | ~2MB |
| Alto | 100.000 | 60 | 1 | ~4MB |
| Ultra | 200.000 | 60 | 1 | ~8MB |

### Otimizações Aplicadas

1. **BufferGeometry** com custom attributes (evita overhead de Object3D)
2. **ShaderMaterial** com animação GPU-side (zero CPU overhead por frame)
3. **Additive blending** (evita sorting de transparência)
4. **depthWrite: false** (evita z-fighting)
5. **frustumCulled: false** (partículas estão espalhadas, culling ineficiente)

## 🔧 Configurações Técnicas

### Material Properties

```javascript
{
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  vertexColors: true
}
```

### Custom Attributes

| Attribute | Type | Descrição |
|---|---|---|
| `aPosition` | `vec3` | Posição base da partícula |
| `aVelocity` | `vec3` | Vetor de velocidade |
| `aColor` | `vec3` | Cor RGB |
| `aSize` | `float` | Tamanho base |
| `aLife` | `float` | Duração do ciclo de vida |

### Uniforms

| Uniform | Type | Descrição |
|---|---|---|
| `uTime` | `float` | Tempo acumulado (segundos) |
| `uPixelRatio` | `float` | Pixel ratio do dispositivo |
| `uSizeMultiplier` | `float` | Multiplicador de tamanho |
| `uSpeedMultiplier` | `float` | Multiplicador de velocidade |

## 🧪 Testes

### Casos de Teste

1. **Ativação/Desativação** - Verificar se partículas aparecem/desaparecem corretamente
2. **Mudança de contagem** - Testar com 1k, 50k, 100k, 200k partículas
3. **Mudança de padrão** - Testar todos os 5 padrões
4. **Mudança de cor** - Testar todos os 4 modos de cor
5. **Performance** - Verificar FPS estável em 60 com 50k partículas
6. **Cleanup** - Verificar se `dispose()` remove todos os recursos

## 🚨 Limitações

- **Máximo de 200.000 partículas** (limite prático de memória)
- **Sem colisão** - Partículas não interagem entre si
- **Sem física real** - Animação é procedural (sin/cos), não simulação física
- **Rebuild de geometria** - Mudanças em count/pattern/colorMode recriam a geometria

## 🔮 Melhorias Futuras

- [ ] GPGPU com `GPUComputationRenderer` para 1M+ partículas
- [ ] Sistema de emissão contínua (não apenas estático)
- [ ] Forças externas (gravidade, vento, turbulência)
- [ ] Colisão com objetos da cena
- [ ] Texturas customizadas para partículas
- [ ] Trail effect (rastro de partículas)

## 📚 Referências

- [Three.js Points Documentation](https://threejs.org/docs/#api/en/objects/Points)
- [ShaderMaterial](https://threejs.org/docs/#api/en/materials/ShaderMaterial)
- [BufferGeometry](https://threejs.org/docs/#api/en/core/BufferGeometry)
- [GPU Particle Systems](https://threejs.org/examples/#webgl_gpgpu_birds)
