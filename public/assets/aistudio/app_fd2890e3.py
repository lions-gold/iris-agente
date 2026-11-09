import sqlite3
from datetime import datetime
from flask import Flask, g, render_template, request, redirect, url_for, flash

DATABASE = "stockllave.db"
TALLAS = [6, 8, 10, 12, 14, 16]

app = Flask(__name__)
app.secret_key = "cambia-esta-clave"

def get_db():
    if "db" not in g:
        g.db = sqlite3.connect(DATABASE)
        g.db.row_factory = sqlite3.Row
    return g.db

@app.teardown_appcontext
def close_db(exc):
    db = g.pop("db", None)
    if db is not None:
        db.close()

def init_db():
    db = sqlite3.connect(DATABASE)
    db.executescript("""
    CREATE TABLE IF NOT EXISTS referencias (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        codigo TEXT UNIQUE NOT NULL,
        descripcion TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS stock (
        referencia_id INTEGER NOT NULL,
        talla INTEGER NOT NULL,
        cantidad INTEGER NOT NULL DEFAULT 0,
        PRIMARY KEY (referencia_id, talla),
        FOREIGN KEY (referencia_id) REFERENCES referencias(id)
    );
    CREATE TABLE IF NOT EXISTS movimientos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        referencia_id INTEGER NOT NULL,
        talla INTEGER NOT NULL,
        tipo TEXT NOT NULL CHECK (tipo IN ('ENTRADA','SALIDA')),
        cantidad INTEGER NOT NULL,
        nota TEXT,
        fecha TEXT NOT NULL,
        FOREIGN KEY (referencia_id) REFERENCES referencias(id)
    );
    """)
    db.commit()
    db.close()

@app.route("/")
def index():
    db = get_db()
    filas = db.execute("""
        SELECT r.id, r.codigo, r.descripcion, 
               COALESCE(SUM(s.cantidad), 0) AS total
        FROM referencias r
        LEFT JOIN stock s ON s.referencia_id = r.id
        GROUP BY r.id
        ORDER BY r.codigo
    """).fetchall()
    return render_template("index.html", referencias=filas)

@app.route("/referencia/nueva", methods=["POST"])
def nueva_referencia():
    codigo = request.form["codigo"].strip()
    descripcion = request.form["descripcion"].strip()
    if not codigo or not descripcion:
        flash("Falta el codigo o la descripcion.")
        return redirect(url_for("index"))
    db = get_db()
    try:
        cur = db.execute(
            "INSERT INTO referencias (codigo, descripcion) VALUES (?, ?)",
            (codigo, descripcion),
        )
        for t in TALLAS:
            db.execute(
                "INSERT INTO stock (referencia_id, talla, cantidad) VALUES (?, ?, 0)",
                (cur.lastrowid, t),
            )
        db.commit()
        flash("Referencia creada.")
    except sqlite3.IntegrityError:
        flash("Esa referencia ya existe.")
    return redirect(url_for("index"))

@app.route("/referencia/<int:ref_id>")
def ver_referencia(ref_id):
    db = get_db()
    ref = db.execute("SELECT * FROM referencias WHERE id = ?", (ref_id,)).fetchone()
    if ref is None:
        return redirect(url_for("index"))
    stock = db.execute(
        "SELECT talla, cantidad FROM stock WHERE referencia_id = ? ORDER BY talla",
        (ref_id,),
    ).fetchall()
    total = sum(f["cantidad"] for f in stock)
    movs = db.execute(
        "SELECT * FROM movimientos WHERE referencia_id = ? ORDER BY id DESC LIMIT 100",
        (ref_id,),
    ).fetchall()
    return render_template(
        "referencia.html", ref=ref, stock=stock, total=total, movs=movs, tallas=TALLAS
    )

@app.route("/referencia/<int:ref_id>/mover", methods=["POST"])
def mover(ref_id):
    tipo = request.form["tipo"]
    nota = request.form.get("nota", "").strip()
    db = get_db()
    hubo_cambios = False
    for t in TALLAS:
        valor = request.form.get(f"talla_{t}", "").strip()
        if not valor:
            continue
        cantidad = int(valor)
        if cantidad <= 0:
            continue
        actual = db.execute(
            "SELECT cantidad FROM stock WHERE referencia_id = ? AND talla = ?",
            (ref_id, t),
        ).fetchone()["cantidad"]
        if tipo == "SALIDA" and cantidad > actual:
            flash(f"Talla {t}: solo hay {actual}, no se puede sacar {cantidad}.")
            continue
        nuevo = actual + cantidad if tipo == "ENTRADA" else actual - cantidad
        db.execute(
            "UPDATE stock SET cantidad = ? WHERE referencia_id = ? AND talla = ?",
            (nuevo, ref_id, t),
        )
        db.execute(
            "INSERT INTO movimientos (referencia_id, talla, tipo, cantidad, nota, fecha) "
            "VALUES (?, ?, ?, ?, ?, ?)",
            (ref_id, t, tipo, cantidad, nota, datetime.now().strftime("%Y-%m-%d %H:%M")),
        )
        hubo_cambios = True
    db.commit()
    if hubo_cambios:
        flash("Movimiento registrado.")
    return redirect(url_for("ver_referencia", ref_id=ref_id))

if __name__ == "__main__":
    init_db()
    app.run(debug=True)
