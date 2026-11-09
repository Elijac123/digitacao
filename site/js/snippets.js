// Trechos de código para a aba Programar (originais, curtos, para treino de digitação).
// Regras: só ASCII digitável direto no ABNT2 (sem crase, til e circunflexo, que exigem tecla morta),
// linhas de até ~54 caracteres, indentação com espaços (o Typer preenche a indentação sozinho após Enter).
// Formato: "== id" abre uma linguagem; "---" separa trechos. String.raw mantém as barras invertidas literais.

const RAW = String.raw`
== javascript
function ordenar(lista) {
  const copia = lista.slice();
  for (let i = 0; i < copia.length; i++) {
    for (let j = 0; j < copia.length - i - 1; j++) {
      if (copia[j] > copia[j + 1]) {
        const tmp = copia[j];
        copia[j] = copia[j + 1];
        copia[j + 1] = tmp;
      }
    }
  }
  return copia;
}
---
const soma = (a, b) => a + b;
---
const dobro = numeros.map((n) => n * 2);
---
function fatorial(n) {
  if (n <= 1) return 1;
  return n * fatorial(n - 1);
}
---
for (let i = 0; i < 10; i++) {
  if (i % 2 === 0) {
    console.log("par: " + i);
  }
}
---
const usuario = {
  nome: "Ana",
  idade: 28,
  ativo: true,
};
console.log(usuario.nome);
---
async function buscar(url) {
  const resposta = await fetch(url);
  if (!resposta.ok) {
    throw new Error("Falha: " + resposta.status);
  }
  return resposta.json();
}
---
class Contador {
  constructor() {
    this.valor = 0;
  }

  incrementar() {
    this.valor += 1;
    return this.valor;
  }
}
---
const total = itens
  .filter((i) => i.ativo)
  .reduce((acc, i) => acc + i.preco, 0);
---
const unicos = [...new Set(lista)];
console.log(unicos.length);
---
const botao = document.querySelector("#botao");
botao.addEventListener("click", () => {
  alert("Oi!");
});

== python
def contar(texto):
    cont = {}
    for palavra in texto.lower().split():
        palavra = palavra.strip(".,;:!?")
        if palavra:
            cont[palavra] = cont.get(palavra, 0) + 1
    return cont
---
print("Ola, mundo!")
---
quadrados = [n * n for n in range(10)]
---
def fatorial(n):
    if n <= 1:
        return 1
    return n * fatorial(n - 1)
---
for i in range(1, 11):
    if i % 3 == 0:
        print("fizz")
    else:
        print(i)
---
usuario = {"nome": "Ana", "idade": 28}
for chave, valor in usuario.items():
    print(chave + ": " + str(valor))
---
class Conta:
    def __init__(self, saldo=0):
        self.saldo = saldo

    def depositar(self, valor):
        self.saldo += valor
        return self.saldo
---
with open("dados.txt") as arquivo:
    linhas = arquivo.readlines()

total = len(linhas)
print("Total:", total)
---
try:
    numero = int(input("Numero: "))
    print(100 / numero)
except ZeroDivisionError:
    print("Nao divida por zero")
except ValueError:
    print("Digite um numero valido")
---
def fib(n):
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a
---
nomes = sorted(pessoas, key=lambda p: p["nome"])

== typescript
interface Produto {
  id: number;
  nome: string;
  preco: number;
}

function total(itens: Produto[]): number {
  let soma = 0;
  for (const item of itens) {
    soma += item.preco;
  }
  return soma;
}
---
let nome: string = "Ana";
---
interface Usuario {
  id: number;
  nome: string;
  email?: string;
}
---
function soma(a: number, b: number): number {
  return a + b;
}
---
type Resultado<T> = {
  dados: T | null;
  erro: string | null;
};
---
const lista: number[] = [1, 2, 3];
const dobro = lista.map((n: number) => n * 2);
---
enum Status {
  Ativo,
  Inativo,
  Pendente,
}

== java
public class Calculadora {
    public int somar(int a, int b) {
        return a + b;
    }

    public int dividir(int a, int b) {
        if (b == 0) {
            throw new IllegalArgumentException("zero");
        }
        return a / b;
    }
}
---
System.out.println("Ola, mundo!");
---
public class Principal {
    public static void main(String[] args) {
        System.out.println("Ola!");
    }
}
---
int soma = 0;
for (int i = 1; i <= 10; i++) {
    soma += i;
}
System.out.println(soma);
---
public int fatorial(int n) {
    if (n <= 1) {
        return 1;
    }
    return n * fatorial(n - 1);
}
---
List<String> nomes = new ArrayList<>();
nomes.add("Ana");
nomes.add("Bia");
for (String nome : nomes) {
    System.out.println(nome);
}
---
public class Pessoa {
    private String nome;

    public Pessoa(String nome) {
        this.nome = nome;
    }

    public String getNome() {
        return nome;
    }
}

== c
#include <stdio.h>

int main(void) {
    int n = 5;
    long fat = 1;
    for (int i = 2; i <= n; i++) {
        fat *= i;
    }
    printf("%d! = %ld\n", n, fat);
    return 0;
}
---
printf("Ola, mundo!\n");
---
#include <stdio.h>

int main(void) {
    printf("Ola!\n");
    return 0;
}
---
int soma = 0;
for (int i = 1; i <= 10; i++) {
    soma += i;
}
printf("%d\n", soma);
---
int maior(int a, int b) {
    if (a > b) {
        return a;
    }
    return b;
}
---
struct Ponto {
    int x;
    int y;
};
---
int vetor[5] = {1, 2, 3, 4, 5};
for (int i = 0; i < 5; i++) {
    printf("%d ", vetor[i]);
}

== cpp
std::cout << "Ola, mundo!" << std::endl;
---
std::vector<int> v = {3, 1, 2};
---
auto dobro = [](int x) { return x * 2; };
---
#include <iostream>

int main() {
    std::cout << "Ola!" << std::endl;
    return 0;
}
---
int soma = 0;
for (int i = 1; i <= 10; i++) {
    soma += i;
}
std::cout << soma << std::endl;
---
std::vector<std::string> nomes = {"Ana", "Bia"};
for (const auto& nome : nomes) {
    std::cout << nome << std::endl;
}
---
template <typename T>
T maior(T a, T b) {
    return (a > b) ? a : b;
}
---
class Pessoa {
public:
    Pessoa(std::string nome) : nome_(nome) {}

    std::string nome() const {
        return nome_;
    }

private:
    std::string nome_;
};
---
#include <algorithm>
#include <iostream>
#include <vector>

int main() {
    std::vector<int> v = {5, 2, 9, 1};
    std::sort(v.begin(), v.end());
    for (int n : v) {
        std::cout << n << " ";
    }
    return 0;
}

== csharp
Console.WriteLine("Ola, mundo!");
---
var numeros = new List<int> { 3, 1, 2 };
---
Console.WriteLine($"Ola, {nome}!");
---
using System;

class Programa {
    static void Main() {
        Console.WriteLine("Ola!");
    }
}
---
int soma = 0;
for (int i = 1; i <= 10; i++) {
    soma += i;
}
Console.WriteLine(soma);
---
public class Pessoa {
    public string Nome { get; set; }
    public int Idade { get; set; }
}
---
var nomes = new List<string> { "Ana", "Bia" };
foreach (var nome in nomes) {
    Console.WriteLine(nome);
}
---
var pares = numeros
    .Where(n => n % 2 == 0)
    .Select(n => n * n)
    .ToList();
---
public int Dividir(int a, int b) {
    if (b == 0) {
        throw new ArgumentException("Divisor zero");
    }
    return a / b;
}
---
using System;
using System.Collections.Generic;

class Programa {
    static void Main() {
        var precos = new Dictionary<string, double>();
        precos["cafe"] = 6.5;
        precos["pao"] = 1.2;
        foreach (var p in precos) {
            Console.WriteLine(p.Key + ": " + p.Value);
        }
    }
}

== sql
SELECT p.nome, SUM(i.quantidade) AS vendidos
FROM produtos p
JOIN itens i ON i.produto_id = p.id
WHERE i.criado_em >= '2024-01-01'
GROUP BY p.nome
HAVING SUM(i.quantidade) > 10
ORDER BY vendidos DESC
LIMIT 5;
---
SELECT * FROM clientes;
---
SELECT nome, email FROM clientes WHERE ativo = 1;
---
SELECT nome, COUNT(*) AS total
FROM pedidos
GROUP BY nome
ORDER BY total DESC;
---
INSERT INTO clientes (nome, email)
VALUES ('Ana', 'ana@email.com');
---
UPDATE produtos SET preco = preco * 1.1 WHERE id = 7;
---
CREATE TABLE produtos (
  id INTEGER PRIMARY KEY,
  nome TEXT NOT NULL,
  preco REAL DEFAULT 0
);
---
SELECT c.nome, p.valor
FROM clientes c
JOIN pedidos p ON p.cliente_id = c.id
WHERE p.valor > 100;
---
DELETE FROM sessoes WHERE expira_em < NOW();

== html
<table>
  <thead>
    <tr>
      <th>Nome</th>
      <th>Idade</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Ana</td>
      <td>28</td>
    </tr>
  </tbody>
</table>
---
<h1>Ola, mundo!</h1>
---
<a href="https://exemplo.com">Visite</a>
---
<ul>
  <li>Maca</li>
  <li>Uva</li>
  <li>Pera</li>
</ul>
---
<form action="/enviar" method="post">
  <label for="nome">Nome</label>
  <input type="text" id="nome" name="nome">
  <button type="submit">Enviar</button>
</form>
---
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <title>Minha pagina</title>
</head>
<body>
  <p>Texto</p>
</body>
</html>
---
<img src="foto.jpg" alt="Uma foto">

== css
:root {
  --cor: #1f7a3a;
  --fundo: #f5fbf6;
}

.painel {
  background: var(--fundo);
  border-left: 4px solid var(--cor);
  padding: 12px 16px;
}
---
body { margin: 0; }
---
.botao {
  color: white;
  background: #1f7a3a;
}
---
.cartao {
  padding: 16px;
  border: 1px solid #ccc;
  border-radius: 8px;
}
---
.grade {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 16px;
}
---
.menu {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
---
@media (max-width: 600px) {
  .grade {
    grid-template-columns: 1fr;
  }
}
---
a:hover { text-decoration: underline; }

== bash
#!/bin/bash
for pasta in */; do
  if [ -d "$pasta" ]; then
    echo "Pasta: $pasta"
    ls "$pasta" | wc -l
  fi
done
---
echo "Ola, mundo!"
---
ls -la | grep ".txt"
---
for arquivo in *.txt; do
  echo "$arquivo"
done
---
if [ -f "dados.csv" ]; then
  echo "Arquivo encontrado"
else
  echo "Arquivo ausente"
fi
---
mkdir -p projeto/src && cd projeto
---
cat log.txt | sort | uniq -c | sort -nr
`;

const NAMES = {
  javascript: "JavaScript", python: "Python", typescript: "TypeScript", java: "Java",
  c: "C", cpp: "C++", csharp: "C#", sql: "SQL", html: "HTML", css: "CSS", bash: "Bash",
};

/** { id: { name, snippets: string[] } } */
export const LANGS = {};
{
  let cur = null;
  let buf = [];
  const flush = () => {
    const code = buf.join("\n").replace(/^\n+|\n+$/g, "");
    if (cur && code) LANGS[cur].snippets.push(code);
    buf = [];
  };
  for (const line of RAW.split("\n")) {
    if (line.startsWith("== ")) {
      flush();
      cur = line.slice(3).trim();
      LANGS[cur] = { name: NAMES[cur] || cur, snippets: [] };
    } else if (line === "---") flush();
    else buf.push(line);
  }
  flush();
}

export const SIZES = { curto: "Curto", medio: "Médio", longo: "Longo" };

/** Classe de tamanho pelo número de caracteres. */
export function sizeOf(code) {
  const n = code.length;
  return n <= 80 ? "curto" : n <= 170 ? "medio" : "longo";
}
