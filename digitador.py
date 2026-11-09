from random import choice
from time import perf_counter


#definindo o player
class Player:
    def __init__(self):
        self.score = 0
        self.name = input("Digite seu nome: ")

    def salvar_pontos(self):
        self.fim = perf_counter()
        self.decorrido = self.fim-self.inicio
        self.tempo = (self.score/5)/((self.decorrido)/60)

        print(self.name + " fez: " + str(round(self.tempo, 0)) + " wpm")


    def paragrafo_aleatorio(self, texto):
        with open(texto, "r", encoding="UTF-8") as palavras:
            paragrafo = choice(palavras.read().split("\n"))
            return paragrafo

    def jogo(self):
        texto = self.paragrafo_aleatorio("memorias_posthumas_bras_cubas.txt")
        self.inicio = perf_counter()
        for char in texto.split():
            continua = False
            print(char)
            while continua == False:
                palavra = input("palavra:")
                if char == palavra:
                    continua = True
                    self.score += len(palavra)
        


eli = Player()

try:
    eli.jogo()
except KeyboardInterrupt:
    eli.salvar_pontos()