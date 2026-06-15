'use client';
import { useEffect, useRef } from 'react';

// Fantasma espectral WebGL que sigue el cursor (adaptado del CodePen de
// jasonkeenan-style "Spectral Ghost"): orbe emisivo rosa que flota, ojos que
// brillan al moverse, luciérnagas, partículas, reveal del fondo y grano analógico.
// Sin GUI (tweakpane) y montado dentro del hero. Three.js se carga en cliente.
export default function GhostHero() {
  const mountRef = useRef(null);

  useEffect(() => {
    let disposed = false;
    let raf = 0;
    let onResize, onMove;
    let renderer;

    (async () => {
      const THREE = await import('three');
      const { EffectComposer } = await import('three/examples/jsm/postprocessing/EffectComposer.js');
      const { RenderPass } = await import('three/examples/jsm/postprocessing/RenderPass.js');
      const { UnrealBloomPass } = await import('three/examples/jsm/postprocessing/UnrealBloomPass.js');
      const { OutputPass } = await import('three/examples/jsm/postprocessing/OutputPass.js');
      const { ShaderPass } = await import('three/examples/jsm/postprocessing/ShaderPass.js');

      const mount = mountRef.current;
      if (!mount || disposed) return;
      const W = () => mount.clientWidth || 1;
      const H = () => mount.clientHeight || 1;

      const PINK = 0xff2e7e;
      const RED = 0xe11d48;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, W() / H(), 0.1, 1000);
      camera.position.z = 20;

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
      renderer.setSize(W(), H());
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 0.9;
      renderer.setClearColor(0x000000, 0);
      const canvas = renderer.domElement;
      Object.assign(canvas.style, { position: 'absolute', inset: '0', width: '100%', height: '100%' });
      mount.appendChild(canvas);

      // ---- post-processing ----
      const composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));
      const bloom = new UnrealBloomPass(new THREE.Vector2(W(), H()), 0.32, 0.7, 0.0);
      composer.addPass(bloom);

      const analogShader = {
        uniforms: { tDiffuse: { value: null }, uTime: { value: 0 }, uRes: { value: new THREE.Vector2(W(), H()) } },
        vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
        fragmentShader: `
          uniform sampler2D tDiffuse; uniform float uTime; varying vec2 vUv;
          float rnd(vec2 s){ return fract(sin(dot(s,vec2(12.9898,78.233)))*43758.5453); }
          void main(){
            vec2 uv=vUv; float t=uTime*1.8;
            float jit=(rnd(vec2(floor(t*60.0)))-0.5)*0.0016; uv.x+=jit;
            float bleed=0.006; float ph=t*1.5+uv.y*20.0;
            float r=texture2D(tDiffuse,uv+vec2(sin(ph)*bleed,0.0)).r;
            float g=texture2D(tDiffuse,uv).g;
            float b=texture2D(tDiffuse,uv-vec2(sin(ph*1.1)*bleed,0.0)).b;
            vec4 col=vec4(r,g,b,texture2D(tDiffuse,uv).a);
            float grain=(rnd(uv*vec2(uTime*0.5+1.0))-0.5)*0.08; col.rgb+=grain*(1.0-col.rgb);
            float scan=sin(uv.y*900.0)*0.04; col.rgb*=(1.0-scan);
            vec2 vg=(uv-0.5)*2.0; col.rgb*=1.0-dot(vg,vg)*0.28;
            gl_FragColor=col;
          }`,
      };
      const analogPass = new ShaderPass(analogShader);
      composer.addPass(analogPass);
      composer.addPass(new OutputPass());

      // ---- atmosphere reveal ----
      const atmoMat = new THREE.ShaderMaterial({
        uniforms: { gp: { value: new THREE.Vector3() }, rad: { value: 40 }, t: { value: 0 } },
        vertexShader: `varying vec3 wp; void main(){ vec4 w=modelMatrix*vec4(position,1.0); wp=w.xyz; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
        fragmentShader: `uniform vec3 gp; uniform float rad; uniform float t; varying vec3 wp;
          void main(){ float d=distance(wp.xy,gp.xy); float dr=rad+sin(t*2.0)*5.0;
            float rev=pow(smoothstep(dr*0.2,dr,d),2.2); float o=mix(0.0,0.32,rev);
            gl_FragColor=vec4(0.02,0.005,0.01,o); }`,
        transparent: true, depthWrite: false,
      });
      const atmo = new THREE.Mesh(new THREE.PlaneGeometry(300, 300), atmoMat);
      atmo.position.z = -50; atmo.renderOrder = -100; scene.add(atmo);

      scene.add(new THREE.AmbientLight(0x0a0a2e, 0.1));

      // ---- ghost ----
      const ghost = new THREE.Group(); scene.add(ghost);
      ghost.scale.setScalar(0.6); // más pequeño
      const geo = new THREE.SphereGeometry(2, 40, 40);
      const pos = geo.getAttribute('position').array;
      for (let i = 0; i < pos.length; i += 3) {
        if (pos[i + 1] < -0.2) {
          const x = pos[i], z = pos[i + 2];
          pos[i + 1] = -2.0 + Math.sin(x * 5) * 0.35 + Math.cos(z * 4) * 0.25 + Math.sin((x + z) * 3) * 0.15;
        }
      }
      geo.computeVertexNormals();
      const mat = new THREE.MeshStandardMaterial({ color: 0x140810, transparent: true, opacity: 0.9, emissive: PINK, emissiveIntensity: 5.2, roughness: 0.02, metalness: 0, side: THREE.DoubleSide });
      const body = new THREE.Mesh(geo, mat); ghost.add(body);

      const rim1 = new THREE.DirectionalLight(0xff5a9e, 1.8); rim1.position.set(-8, 6, -4); scene.add(rim1);
      const rim2 = new THREE.DirectionalLight(0xff2e7e, 1.2); rim2.position.set(8, -4, -6); scene.add(rim2);

      // eyes
      const eyeGeo = new THREE.SphereGeometry(0.3, 12, 12);
      const sockGeo = new THREE.SphereGeometry(0.45, 16, 16);
      const sockMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
      const mkEye = (sx) => {
        const sock = new THREE.Mesh(sockGeo, sockMat); sock.position.set(sx, 0.6, 1.9); sock.scale.set(1.1, 1, 0.6); ghost.add(sock);
        const m = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 });
        const e = new THREE.Mesh(eyeGeo, m); e.position.set(sx, 0.6, 2.0); ghost.add(e);
        return m;
      };
      const eyeL = mkEye(-0.7), eyeR = mkEye(0.7);

      // fireflies
      const flies = [];
      const flyGroup = new THREE.Group(); scene.add(flyGroup);
      for (let i = 0; i < 16; i++) {
        const fm = new THREE.MeshBasicMaterial({ color: 0xff8fc0, transparent: true, opacity: 0.9 });
        const f = new THREE.Mesh(new THREE.SphereGeometry(0.025, 4, 4), fm);
        f.position.set((Math.random() - 0.5) * 40, (Math.random() - 0.5) * 26, (Math.random() - 0.5) * 18);
        f.userData = { v: new THREE.Vector3((Math.random() - 0.5) * 0.04, (Math.random() - 0.5) * 0.04, (Math.random() - 0.5) * 0.04), ph: Math.random() * 6.28, fm };
        flyGroup.add(f); flies.push(f);
      }

      // particles
      const particles = [];
      const pGroup = new THREE.Group(); scene.add(pGroup);
      const pGeos = [new THREE.SphereGeometry(0.05, 6, 6), new THREE.TetrahedronGeometry(0.045, 0), new THREE.OctahedronGeometry(0.05, 0)];
      const spawn = () => {
        if (particles.length > 220) return;
        const g = pGeos[(Math.random() * pGeos.length) | 0];
        const c = new THREE.Color(Math.random() > 0.5 ? PINK : 0xffffff);
        const m = new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: Math.random() * 0.9 });
        const p = new THREE.Mesh(g, m);
        p.position.copy(ghost.position); p.position.z -= 0.8 + Math.random() * 0.6;
        p.position.x += (Math.random() - 0.5) * 3.5; p.position.y += (Math.random() - 0.5) * 3.5 - 0.8;
        const s = 0.6 + Math.random() * 0.7; p.scale.set(s, s, s);
        p.userData = { life: 1, decay: Math.random() * 0.004 + 0.006, v: { x: (Math.random() - 0.5) * 0.012, y: (Math.random() - 0.5) * 0.012 - 0.002, z: (Math.random() - 0.5) * 0.012 - 0.006 }, rot: { x: (Math.random() - 0.5) * 0.02, y: (Math.random() - 0.5) * 0.02, z: (Math.random() - 0.5) * 0.02 } };
        pGroup.add(p); particles.push(p);
      };

      // mouse (relativo al hero)
      const mouse = new THREE.Vector2(0, 0);
      let moving = false, moveTO;
      onMove = (e) => {
        const r = mount.getBoundingClientRect();
        mouse.x = ((e.clientX - r.left) / r.width) * 2 - 1;
        mouse.y = -((e.clientY - r.top) / r.height) * 2 + 1;
        moving = true; clearTimeout(moveTO); moveTO = setTimeout(() => (moving = false), 90);
      };
      window.addEventListener('mousemove', onMove, { passive: true });

      onResize = () => { camera.aspect = W() / H(); camera.updateProjectionMatrix(); renderer.setSize(W(), H()); composer.setSize(W(), H()); bloom.setSize(W(), H()); analogPass.uniforms.uRes.value.set(W(), H()); };
      window.addEventListener('resize', onResize);

      let t = 0, last = 0, mv = 0, lastSpawn = 0;
      const loop = (ts) => {
        raf = requestAnimationFrame(loop);
        const dt = ts - last; last = ts; if (dt > 100) return;
        t += (dt / 16.67) * 0.01;
        atmoMat.uniforms.t.value = t; analogPass.uniforms.uTime.value = t;

        const tx = mouse.x * 4.2, ty = mouse.y * 3.0 - 2.2; // centrado + un poco abajo
        const prev = ghost.position.clone();
        ghost.position.x += (tx - ghost.position.x) * 0.075;
        ghost.position.y += (ty - ghost.position.y) * 0.075;
        atmoMat.uniforms.gp.value.copy(ghost.position);
        mv = mv * 0.95 + prev.distanceTo(ghost.position) * 0.05;
        ghost.position.y += Math.sin(t * 2.4) * 0.03 + Math.cos(t * 1.1) * 0.018;

        mat.emissiveIntensity = 5.2 + Math.sin(t * 1.6) * 0.6 + Math.sin(t * 0.6) * 0.12;
        const sc = 1 + Math.sin(t * 2.1) * 0.02 + Math.sin(t * 0.8) * 0.012;
        body.scale.set(sc, sc, sc);
        body.rotation.y = Math.sin(t * 1.4) * 0.05;

        const target = mv > 0.07 ? 1 : 0;
        eyeL.opacity += (target - eyeL.opacity) * (mv > 0.07 ? 0.6 : 0.31);
        eyeR.opacity = eyeL.opacity;

        for (const f of flies) {
          const pl = Math.sin((t + f.userData.ph) * 3) * 0.4 + 0.6;
          f.userData.fm.opacity = 0.9 * pl;
          f.userData.v.x += (Math.random() - 0.5) * 0.001; f.userData.v.y += (Math.random() - 0.5) * 0.001;
          f.userData.v.clampLength(0, 0.04); f.position.add(f.userData.v);
          if (Math.abs(f.position.x) > 30) f.userData.v.x *= -0.5;
          if (Math.abs(f.position.y) > 20) f.userData.v.y *= -0.5;
          if (Math.abs(f.position.z) > 15) f.userData.v.z *= -0.5;
        }

        if (mv > 0.005 && moving && ts - lastSpawn > 90) { for (let i = 0; i < 4; i++) spawn(); lastSpawn = ts; }
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i]; p.userData.life -= p.userData.decay; p.material.opacity = p.userData.life * 0.85;
          p.position.x += p.userData.v.x; p.position.y += p.userData.v.y; p.position.z += p.userData.v.z;
          p.rotation.x += p.userData.rot.x; p.rotation.y += p.userData.rot.y; p.rotation.z += p.userData.rot.z;
          if (p.userData.life <= 0) { pGroup.remove(p); p.geometry.dispose?.(); p.material.dispose(); particles.splice(i, 1); }
        }
        composer.render();
      };
      raf = requestAnimationFrame(loop);

      // cleanup
      disposed = () => {};
      mountRef.current._cleanup = () => {
        cancelAnimationFrame(raf);
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('resize', onResize);
        renderer.dispose(); composer.dispose?.();
        if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
      };
    })();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      if (onMove) window.removeEventListener('mousemove', onMove);
      if (onResize) window.removeEventListener('resize', onResize);
      if (mountRef.current && mountRef.current._cleanup) mountRef.current._cleanup();
      else if (renderer) { try { renderer.dispose(); } catch {} }
    };
  }, []);

  return <div ref={mountRef} className="ghost-hero" aria-hidden="true" />;
}
