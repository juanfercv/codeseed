# CODESEED

---

## Instalacion 
npm install **o** npm i

## Correr con 
npm run dev

## 1. **Variables y Tipos**
```javascript
let nombre = "Juan";
let edad = 25;
console.log(nombre, edad);
```
**Salida esperada:** `Juan 25`

## 2. **Operadores Aritméticos**
```javascript
let base = 8;
let altura = 5;
let area = base * altura;
console.log(area);
```
**Salida esperada:** `40`

## 3. **Comparación de Valores**
```javascript
let a = 15;
let b = 10;
let resultado = a > b;
console.log(resultado);
```
**Salida esperada:** `true`

## 4. **Función Básica**
```javascript
function saludar() {
    console.log("¡Hola!");
}
saludar();
```
**Salida esperada:** `¡Hola!`

## 5. **Función con Parámetros**
```javascript
function multiplicar(a, b) {
    let resultado = a * b;
    console.log(resultado);
}
multiplicar(5, 3);
```
**Salida esperada:** `15`

## 6. **Función con Return**
```javascript
function cuadrado(num) {
    return num * num;
}
console.log(cuadrado(4));
```
**Salida esperada:** `16`

## 7. **Condicional If**
```javascript
let nota = 7;
if (nota >= 6) {
    console.log("Aprobado");
}
```
**Salida esperada:** `Aprobado`

## 8. **Bucle For**
```javascript
for (let i = 1; i <= 5; i++) {
    console.log(i);
}
```
**Salida esperada:**
```
1
2
3
4
5
```

## 9. **Array Básico**
```javascript
let numeros = [1, 2, 3];
console.log(numeros.length);
```
**Salida esperada:** `3`

## 10. **Método Map**
```javascript
let arr = [1, 2, 3];
let duplicado = arr.map(function(num) {
    return num * 2;
});
console.log(duplicado);
```
**Salida esperada:** `[2,4,6]`

