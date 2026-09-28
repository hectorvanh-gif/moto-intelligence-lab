"""
Saber si dos titulares cuentan la misma historia.

Vive aparte porque lo usan dos cosas: el agente, para no guardar la misma
noticia que ya publico otro medio, y el boletin, para no mandarla dos
veces en el mismo correo. Tenerlo en un solo lugar evita que las dos
copias se separen con el tiempo.

La deduplicacion del agente era por URL, asi que la misma historia entraba
tantas veces como medios la publicaran: habia tres notas del parte medico
de Joan Mir y cuatro del primer triunfo de Acosta en Austria.
"""

import unicodedata

# Palabras que aparecen en casi todos los titulares de moto y no
# distinguen una historia de otra.
VACIAS = {
    "de", "del", "la", "el", "los", "las", "en", "y", "a", "con", "por",
    "para", "su", "sus", "un", "una", "que", "se", "al", "lo", "es", "tras",
    "sobre", "mas", "moto", "motogp", "motos", "gran", "premio",
}

# Cuantas letras se conservan de cada palabra. Hace de raiz burda:
# "campeona" y "campeones" son la misma historia, igual que "mundial" y
# "mundiales", pero como palabras completas no coinciden nunca.
RAIZ = 6

# Dos condiciones, y las dos hacen falta.
#
# El 0.35 es bajo a proposito: dos medios cuentan lo mismo con palabras
# distintas. Con 0.5 entraban las dos versiones del fichaje de Chantra por
# Honda, que solo comparten "chantra" y "honda".
#
# Y hacen falta al menos dos palabras compartidas, no solo el porcentaje:
# un titular con dos palabras significativas que comparta una sola ya
# daria 0.5, y se fusionarian dos historias distintas por coincidir en una
# marca.
UMBRAL = 0.35
MINIMO_COMUNES = 2


def fichas(titulo: str) -> set[str]:
    """Palabras significativas del titular, sin acentos ni puntuacion."""
    t = unicodedata.normalize("NFD", (titulo or "").lower())
    t = "".join(c for c in t if unicodedata.category(c) != "Mn")
    t = "".join(c if c.isalnum() or c.isspace() else " " for c in t)
    return {p[:RAIZ] for p in t.split() if len(p) > 2 and p not in VACIAS}


def misma_historia(a: str, b: str) -> bool:
    fa, fb = fichas(a), fichas(b)
    if not fa or not fb:
        return False
    comunes = len(fa & fb)
    return (
        comunes >= MINIMO_COMUNES
        and comunes / min(len(fa), len(fb)) >= UMBRAL
    )


def ya_contada(titulo: str, anteriores: list[str]) -> str | None:
    """Devuelve el titular anterior que cuenta lo mismo, o None."""
    for previo in anteriores:
        if misma_historia(titulo, previo):
            return previo
    return None
