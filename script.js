// Obsługa otwierania i zamykania okien modalnych
function openTransferModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        document.body.classList.add('modal-open');
    }
}

function closeTransferModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.classList.remove('modal-open');
    }
}

// Zamykanie okna po kliknięciu poza jego obszar
window.onclick = function(event) {
    if (event.target.classList.contains('modal-overlay')) {
        event.target.style.display = 'none';
        document.body.classList.remove('modal-open');
    }
};

// Pomocnicza funkcja do przeliczania tekstu z kwotą (np. "12 500 000 €" lub "12.5M €") na czystą liczbę
function parseKwota(tekst) {
    if (!tekst) return 0;
    
    // Czyszczenie ze spacji, symboli walut i zamiana przecinka na kropkę
    let clean = tekst.replace(/\s+/g, '').replace('€', '').replace('zł', '').replace(',', '.').toLowerCase();
    
    let mnoznik = 1;
    if (clean.includes('m')) {
        mnoznik = 1000000;
        clean = clean.replace('m', '');
    } else if (clean.includes('k')) {
        mnoznik = 1000;
        clean = clean.replace('k', '');
    }
    
    const wartosc = parseFloat(clean);
    return isNaN(wartosc) ? 0 : wartosc * mnoznik;
}

// Funkcja formatująca liczbę z powrotem do ładnego zapisu walutowego
function formatujKwote(kwota) {
    return kwota.toLocaleString('pl-PL') + ' €';
}

// Automatyczne podsumowanie transferów i wypożyczeń
function aktualizujPodsumowaniaTransferow() {
    // 1. TRANSFERY PRZYCHODZĄCE (Wydatki)
    const modalPrzychodzace = document.getElementById('modal-przychodzace');
    if (modalPrzychodzace) {
        const karty = modalPrzychodzace.querySelectorAll('details.transfer-card');
        let sumaWydatkow = 0;

        karty.forEach(karta => {
            const etykiety = karta.querySelectorAll('.detail-label');
            etykiety.forEach(label => {
                if (label.textContent.includes('Kwota Transferu')) {
                    const wartoscTekst = label.nextElementSibling ? label.nextElementSibling.textContent : '';
                    sumaWydatkow += parseKwota(wartoscTekst);
                }
            });
        });

        const podsumowanie = modalPrzychodzace.querySelector('.transfer-summary');
        if (podsumowanie) {
            podsumowanie.innerHTML = `
                <strong>📊 PODSUMOWANIE OKIENKA</strong>
                <p><strong>Wydatki ogółem:</strong> ${formatujKwote(sumaWydatkow)}</p>
                <p><strong>Przeprowadzone transfery:</strong> ${karty.length}</p>
            `;
        }
    }

    // 2. TRANSFERY WYCHODZĄCE (Przychody)
    const modalWychodzace = document.getElementById('modal-wychodzace');
    if (modalWychodzace) {
        const karty = modalWychodzace.querySelectorAll('details.transfer-card');
        let sumaPrzychodow = 0;

        karty.forEach(karta => {
            const etykiety = karta.querySelectorAll('.detail-label');
            etykiety.forEach(label => {
                if (label.textContent.includes('Kwota Transferu')) {
                    const wartoscTekst = label.nextElementSibling ? label.nextElementSibling.textContent : '';
                    sumaPrzychodow += parseKwota(wartoscTekst);
                }
            });
        });

        const podsumowanie = modalWychodzace.querySelector('.transfer-summary');
        if (podsumowanie) {
            podsumowanie.innerHTML = `
                <strong>📊 PODSUMOWANIE OKIENKA</strong>
                <p><strong>Przychody ogółem:</strong> ${formatujKwote(sumaPrzychodow)}</p>
                <p><strong>Sprzedani zawodnicy:</strong> ${karty.length}</p>
            `;
        }
    }

    // 3. WYPOŻYCZENIA (Tylko liczba aktywnych wypożyczeń)
    const modalWypozyczenia = document.getElementById('modal-wypozyczenia');
    if (modalWypozyczenia) {
        const karty = modalWypozyczenia.querySelectorAll('details.transfer-card');
        const podsumowanie = modalWypozyczenia.querySelector('.transfer-summary');
        if (podsumowanie) {
            podsumowanie.innerHTML = `
                <strong>📊 PODSUMOWANIE OKIENKA</strong>
                <p><strong>Aktywne wypożyczenia:</strong> ${karty.length}</p>
            `;
        }
    }
}

// Glówny inicjalizator po załadowaniu drzewa DOM
document.addEventListener('DOMContentLoaded', () => {
    // Przeprowadź kalkulację transferów
    aktualizujPodsumowaniaTransferow();

    // Inicjalizacja i sortowanie tabeli ligowej
    const tableBody = document.querySelector('#tabela-ligowa tbody');
    if (tableBody) {
        const rows = Array.from(tableBody.querySelectorAll('tr'));

        rows.sort((a, b) => {
            const ptsA = (parseInt(a.getAttribute('data-z')) * 3) + parseInt(a.getAttribute('data-r'));
            const ptsB = (parseInt(b.getAttribute('data-z')) * 3) + parseInt(b.getAttribute('data-r'));
            return ptsB - ptsA;
        });

        rows.forEach((row, index) => {
            const z = parseInt(row.getAttribute('data-z')) || 0;
            const r = parseInt(row.getAttribute('data-r')) || 0;
            const p = parseInt(row.getAttribute('data-p')) || 0;
            
            row.querySelector('.m').textContent = z + r + p;
            row.querySelector('.z').textContent = z;
            row.querySelector('.r').textContent = r;
            row.querySelector('.p').textContent = p;
            row.querySelector('.pkt').innerHTML = `<strong>${(z * 3) + r}</strong>`;
            
            row.cells[0].textContent = index + 1;
            
            tableBody.appendChild(row);
        });
    }
});

// Otwieranie okna modalnego (np. kalendarza)
function openMatchModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
    }
}

// Zamykanie konkretnego okna modalnego
function closeMatchModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// Wyświetlanie szczegółów pojedynczego meczu NA OTWARCIE KALENDARZA
function showMatchDetails(title, date, competition, events) {
    // Wypełnienie danych w oknie szczegółów
    document.getElementById('match-modal-title').innerText = title;
    document.getElementById('match-modal-score').innerText = title;
    document.getElementById('match-modal-date').innerText = 'Data: ' + date;
    document.getElementById('match-modal-comp').innerText = competition;
    document.getElementById('match-modal-events').innerHTML = events;

    // Otwarcie okna szczegółów (pojawi się na wierzchu dzięki z-index: 2000)
    openMatchModal('modal-szczegoly-meczu');
}
