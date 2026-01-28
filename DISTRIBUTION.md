# Guía de Distribución de OpenCleaner

## 🚨 Problema Actual

La aplicación construida con `npm run build:mac` no se puede abrir en macOS 15 (Sequoia) debido a problemas de firma de código (code signing). El sistema operativo detecta que el ejecutable principal y el Electron Framework tienen firmas incompatibles y bloquea el lanzamiento.

**Error específico:**
```
Library not loaded: @rpath/Electron Framework.framework/Electron Framework
Reason: code signature not valid for use in process: mapping process and mapped file (non-platform) have different Team IDs
```

---

## ✅ Soluciones

### **Opción 1: Modo Desarrollo (Funcionando Actualmente)**

La aplicación funciona perfectamente en modo desarrollo sin necesidad de firma.

**Para ejecutar:**
```bash
npm run dev
```

**Ventajas:**
- ✅ Funciona inmediatamente
- ✅ Hot reload para desarrollo
- ✅ Sin necesidad de certificados
- ✅ Acceso completo a todas las funcionalidades

**Desventajas:**
- ❌ Requiere tener Node.js y dependencias instaladas
- ❌ No es portable (no se puede distribuir como .app)

---

### **Opción 2: Certificado de Apple Developer (Recomendado para Distribución)**

Para crear un instalable que funcione en macOS 15 Sequoia, necesitas firmar la aplicación con un certificado oficial de Apple.

#### Pasos:

**1. Inscripción en Apple Developer Program**
- URL: https://developer.apple.com/programs/
- Costo: $99 USD/año
- Proceso: 1-2 días laborables para aprobación

**2. Crear Certificados**
- Ir a: https://developer.apple.com/account/resources/certificates/list
- Crear: "Developer ID Application" certificate
- Descargar e instalar en Keychain Access

**3. Configurar electron-builder**

Crear archivo `build/entitlements.mac.plist`:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>com.apple.security.cs.allow-jit</key>
    <true/>
    <key>com.apple.security.cs.allow-unsigned-executable-memory</key>
    <true/>
    <key>com.apple.security.cs.allow-dyld-environment-variables</key>
    <true/>
    <key>com.apple.security.automation.apple-events</key>
    <true/>
    <key>com.apple.security.files.user-selected.read-write</key>
    <true/>
  </dict>
</plist>
```

Crear archivo `build/entitlements.mac.inherit.plist`:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>com.apple.security.cs.allow-jit</key>
    <true/>
    <key>com.apple.security.cs.allow-unsigned-executable-memory</key>
    <true/>
    <key>com.apple.security.cs.allow-dyld-environment-variables</key>
    <true/>
    <key>com.apple.security.automation.apple-events</key>
    <true/>
  </dict>
</plist>
```

Actualizar `electron-builder.yml`:
```yaml
mac:
  category: public.app-category.utilities
  icon: build/icon.icns
  identity: "Developer ID Application: TU NOMBRE (TEAM_ID)"
  hardenedRuntime: true
  gatekeeperAssess: false
  entitlements: build/entitlements.mac.plist
  entitlementsInherit: build/entitlements.mac.inherit.plist
  target:
    - target: dmg
      arch:
        - arm64
        - x64
```

**4. Construir y Notarizar**
```bash
# Build
npm run build:mac

# Notarización (opcional pero recomendado)
xcrun notarytool submit dist/OpenCleaner-1.0.0-arm64.dmg \
  --apple-id "tu-email@ejemplo.com" \
  --password "app-specific-password" \
  --team-id "TEAM_ID" \
  --wait

# Staple (adjuntar notarización)
xcrun stapler staple dist/OpenCleaner-1.0.0-arm64.dmg
```

**Ventajas:**
- ✅ App funciona en cualquier Mac con macOS 15+
- ✅ No requiere deshabilitar seguridad
- ✅ Distribución profesional
- ✅ Compatible con App Store (con ajustes adicionales)

**Desventajas:**
- ❌ Costo anual de $99 USD
- ❌ Proceso de aprobación de 1-2 días
- ❌ Requiere configuración adicional

---

### **Opción 3: Desactivar Gatekeeper (Solo Desarrollo/Uso Personal)**

**⚠️ ADVERTENCIA:** Esta opción reduce la seguridad del sistema. Solo para testing personal, NO para distribución.

**Desactivar Gatekeeper completamente:**
```bash
sudo spctl --master-disable
```

**Reactivar Gatekeeper:**
```bash
sudo spctl --master-enable
```

**Permitir solo esta app específica:**
```bash
sudo xattr -cr /Applications/OpenCleaner.app
sudo codesign --force --deep --sign - /Applications/OpenCleaner.app
```

**Ventajas:**
- ✅ No requiere certificado
- ✅ Gratuito
- ✅ Rápido

**Desventajas:**
- ❌ Reduce seguridad del sistema
- ❌ No recomendable para distribución
- ❌ Puede romperse con actualizaciones de macOS
- ❌ Los usuarios finales no deberían hacer esto

---

### **Opción 4: Distribución Alternativa**

Si no quieres pagar el certificado pero necesitas distribuir la app:

#### **A) GitHub Releases**
1. Subir el código fuente a GitHub
2. Crear un release con instrucciones:
   ```markdown
   ## Instalación

   1. Clonar el repositorio
   2. Instalar dependencias: `npm install`
   3. Ejecutar: `npm run dev`
   ```

#### **B) Homebrew Cask**
Crear una fórmula para instalación fácil:
```ruby
cask "opencleaner" do
  version "1.0.0"
  sha256 "..."

  url "https://github.com/usuario/opencleaner/releases/download/v#{version}/OpenCleaner-#{version}-arm64.dmg"
  name "OpenCleaner"
  desc "macOS application uninstaller"
  homepage "https://github.com/usuario/opencleaner"

  app "OpenCleaner.app"
end
```

Instalación para usuarios:
```bash
brew install --cask opencleaner
```

#### **C) Script de Instalación Automática**
Crear `install.sh`:
```bash
#!/bin/bash
# OpenCleaner Installer

echo "📦 Installing OpenCleaner..."

# Check if Homebrew is installed
if ! command -v brew &> /dev/null; then
    echo "Installing Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Installing Node.js..."
    brew install node
fi

# Clone repository
git clone https://github.com/usuario/opencleaner.git
cd opencleaner

# Install dependencies
npm install

# Create launch script
cat > launch.sh << 'EOF'
#!/bin/bash
cd "$(dirname "$0")"
npm run dev
EOF

chmod +x launch.sh

echo "✅ Installation complete!"
echo "Run: ./launch.sh"
```

**Ventajas:**
- ✅ Gratuito
- ✅ Open source friendly
- ✅ Los usuarios técnicos pueden instalar fácilmente

**Desventajas:**
- ❌ Requiere Node.js instalado
- ❌ No es un .app portable
- ❌ Menos profesional

---

### **Opción 5: Electron Forge (Alternativa a electron-builder)**

Electron Forge a veces maneja mejor la firma en macOS 15:

**Instalar Electron Forge:**
```bash
npm install --save-dev @electron-forge/cli
npx electron-forge import
```

**Configurar `forge.config.js`:**
```javascript
module.exports = {
  packagerConfig: {
    asar: true,
    osxSign: {
      identity: 'Developer ID Application: Tu Nombre (TEAM_ID)',
      hardenedRuntime: true,
      entitlements: 'build/entitlements.mac.plist',
      'entitlements-inherit': 'build/entitlements.mac.inherit.plist',
      'signature-flags': 'library'
    }
  },
  makers: [
    {
      name: '@electron-forge/maker-dmg',
      config: {
        format: 'ULFO'
      }
    }
  ]
}
```

**Construir:**
```bash
npm run make
```

---

## 📋 Checklist para Distribución Oficial

Si decides ir por la ruta oficial con certificado:

- [ ] Inscribirse en Apple Developer Program ($99/año)
- [ ] Esperar aprobación (1-2 días)
- [ ] Crear certificado "Developer ID Application"
- [ ] Instalar certificado en Keychain
- [ ] Crear archivos entitlements (`build/entitlements.mac.plist`)
- [ ] Actualizar `electron-builder.yml` con identity
- [ ] Construir app: `npm run build:mac`
- [ ] Notarizar con notarytool
- [ ] Staple notarización al DMG
- [ ] Probar en Mac limpio sin Xcode
- [ ] Distribuir

---

## 🎯 Recomendación

**Para desarrollo y uso personal:**
- Usar `npm run dev` (Opción 1)

**Para distribución a otros usuarios:**
- Si tienes presupuesto: Apple Developer Certificate (Opción 2)
- Si es open source: GitHub + Homebrew (Opción 4)
- Si es para un grupo pequeño: Script de instalación (Opción 4C)

---

## 📚 Recursos Útiles

- [Electron Code Signing](https://www.electronjs.org/docs/latest/tutorial/code-signing)
- [electron-builder macOS docs](https://www.electron.build/configuration/mac)
- [Apple Notarization Guide](https://developer.apple.com/documentation/security/notarizing_macos_software_before_distribution)
- [macOS Code Signing](https://developer.apple.com/support/code-signing/)

---

## 🐛 Solución de Problemas

### Error: "Team IDs different"
- Causa: Firma inconsistente entre ejecutable y frameworks
- Solución: Usar certificado oficial o Opción 1 (modo dev)

### Error: "App dañada"
- Causa: Gatekeeper bloqueando app sin notarizar
- Solución temporal: `xattr -cr /Applications/OpenCleaner.app`
- Solución permanente: Notarizar la app

### Error: "Cannot find identity"
- Causa: Certificado no instalado correctamente
- Solución: Revisar Keychain Access, reinstalar certificado

---

**Última actualización:** 28 Enero 2026
**Versión de macOS probada:** 15.0.1 (Sequoia)
**Versión de Electron:** 39.3.0
