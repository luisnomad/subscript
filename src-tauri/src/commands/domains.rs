// Domain command handlers

use crate::db::{get_db_connection, DatabaseType};
use crate::models::Domain;
use crate::utils::get_current_timestamp;
use anyhow::Result;

#[tauri::command]
pub fn get_domains(test_mode: bool) -> Result<Vec<Domain>, String> {
    let db_type = if test_mode {
        DatabaseType::Test
    } else {
        DatabaseType::Production
    };

    let conn = get_db_connection(db_type).map_err(|e| e.to_string())?;

    let mut stmt = conn
        .prepare("SELECT id, name, registrar, amount, currency, registration_date, expiry_date, auto_renew, status, notes, created_at, updated_at FROM domains ORDER BY expiry_date ASC")
        .map_err(|e| e.to_string())?;

    let domains = stmt
        .query_map([], |row| {
            Ok(Domain {
                id: Some(row.get(0)?),
                name: row.get(1)?,
                registrar: row.get(2)?,
                amount: row.get(3)?,
                currency: row.get(4)?,
                registration_date: row.get(5)?,
                expiry_date: row.get(6)?,
                auto_renew: row.get::<_, i32>(7)? != 0,
                status: row.get(8)?,
                notes: row.get(9)?,
                created_at: row.get(10)?,
                updated_at: row.get(11)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(domains)
}

#[tauri::command]
pub fn get_domain_by_id(id: i64, test_mode: bool) -> Result<Domain, String> {
    let db_type = if test_mode {
        DatabaseType::Test
    } else {
        DatabaseType::Production
    };

    let conn = get_db_connection(db_type).map_err(|e| e.to_string())?;

    let domain = conn
        .query_row(
            "SELECT id, name, registrar, amount, currency, registration_date, expiry_date, auto_renew, status, notes, created_at, updated_at FROM domains WHERE id = ?1",
            [id],
            |row| {
                Ok(Domain {
                    id: Some(row.get(0)?),
                    name: row.get(1)?,
                    registrar: row.get(2)?,
                    amount: row.get(3)?,
                    currency: row.get(4)?,
                    registration_date: row.get(5)?,
                    expiry_date: row.get(6)?,
                    auto_renew: row.get::<_, i32>(7)? != 0,
                    status: row.get(8)?,
                    notes: row.get(9)?,
                    created_at: row.get(10)?,
                    updated_at: row.get(11)?,
                })
            },
        )
        .map_err(|e| e.to_string())?;

    Ok(domain)
}

#[tauri::command]
pub fn create_domain(domain: Domain, test_mode: bool) -> Result<i64, String> {
    let db_type = if test_mode {
        DatabaseType::Test
    } else {
        DatabaseType::Production
    };

    let conn = get_db_connection(db_type).map_err(|e| e.to_string())?;

    let now = get_current_timestamp();

    conn.execute(
        "INSERT INTO domains (name, registrar, amount, currency, registration_date, expiry_date, auto_renew, status, notes, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)",
        rusqlite::params![
            domain.name,
            domain.registrar,
            domain.amount,
            domain.currency,
            domain.registration_date,
            domain.expiry_date,
            if domain.auto_renew { 1 } else { 0 },
            domain.status,
            domain.notes,
            now,
            now,
        ],
    )
    .map_err(|e| e.to_string())?;

    Ok(conn.last_insert_rowid())
}

#[tauri::command]
pub fn update_domain(domain: Domain, test_mode: bool) -> Result<(), String> {
    let db_type = if test_mode {
        DatabaseType::Test
    } else {
        DatabaseType::Production
    };

    let conn = get_db_connection(db_type).map_err(|e| e.to_string())?;

    let now = get_current_timestamp();

    let id = domain.id.ok_or("Domain ID is required for update")?;

    conn.execute(
        "UPDATE domains SET name = ?1, registrar = ?2, amount = ?3, currency = ?4, registration_date = ?5, expiry_date = ?6, auto_renew = ?7, status = ?8, notes = ?9, updated_at = ?10 WHERE id = ?11",
        rusqlite::params![
            domain.name,
            domain.registrar,
            domain.amount,
            domain.currency,
            domain.registration_date,
            domain.expiry_date,
            if domain.auto_renew { 1 } else { 0 },
            domain.status,
            domain.notes,
            now,
            id,
        ],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn delete_domain(id: i64, test_mode: bool) -> Result<(), String> {
    let db_type = if test_mode {
        DatabaseType::Test
    } else {
        DatabaseType::Production
    };

    let conn = get_db_connection(db_type).map_err(|e| e.to_string())?;

    conn.execute("DELETE FROM domains WHERE id = ?1", [id])
        .map_err(|e| e.to_string())?;

    Ok(())
}
