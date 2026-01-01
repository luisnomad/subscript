// Domain command handlers

use crate::db::{get_db_connection, DatabaseType};
use crate::models::Domain;
use crate::utils::{get_current_timestamp, AppResult};

#[tauri::command]
pub fn get_domains(test_mode: bool) -> AppResult<Vec<Domain>> {
    let db_type = if test_mode {
        DatabaseType::Test
    } else {
        DatabaseType::Production
    };

    let conn = get_db_connection(db_type)?;

    let mut stmt = conn
        .prepare("SELECT id, name, registrar, cost, currency, registration_date, expiry_date, auto_renew, status, notes, created_at, updated_at FROM domains ORDER BY expiry_date ASC")?;

    let domains = stmt
        .query_map([], |row| {
            Ok(Domain {
                id: Some(row.get(0)?),
                name: row.get(1)?,
                registrar: row.get(2)?,
                cost: row.get(3)?,
                currency: row.get(4)?,
                registration_date: row.get(5)?,
                expiry_date: row.get(6)?,
                auto_renew: row.get::<_, i32>(7)? != 0,
                status: row.get(8)?,
                notes: row.get(9)?,
                created_at: row.get(10)?,
                updated_at: row.get(11)?,
            })
        })?
        .collect::<Result<Vec<_>, _>>()?;

    Ok(domains)
}

#[tauri::command]
pub fn get_domain_by_id(id: i64, test_mode: bool) -> AppResult<Domain> {
    let db_type = if test_mode {
        DatabaseType::Test
    } else {
        DatabaseType::Production
    };

    let conn = get_db_connection(db_type)?;

    let domain = conn
        .query_row(
            "SELECT id, name, registrar, cost, currency, registration_date, expiry_date, auto_renew, status, notes, created_at, updated_at FROM domains WHERE id = ?1",
            [id],
            |row| {
                Ok(Domain {
                    id: Some(row.get(0)?),
                    name: row.get(1)?,
                    registrar: row.get(2)?,
                    cost: row.get(3)?,
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
        )?;

    Ok(domain)
}

#[tauri::command]
pub fn create_domain(domain: Domain, test_mode: bool) -> AppResult<i64> {
    let db_type = if test_mode {
        DatabaseType::Test
    } else {
        DatabaseType::Production
    };

    let conn = get_db_connection(db_type)?;

    let now = get_current_timestamp();

    conn.execute(
        "INSERT INTO domains (name, registrar, cost, currency, registration_date, expiry_date, auto_renew, status, notes, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)",
        rusqlite::params![
            domain.name,
            domain.registrar,
            domain.cost,
            domain.currency,
            domain.registration_date,
            domain.expiry_date,
            if domain.auto_renew { 1 } else { 0 },
            domain.status,
            domain.notes,
            now,
            now,
        ],
    )?;

    Ok(conn.last_insert_rowid())
}

#[tauri::command]
pub fn update_domain(domain: Domain, test_mode: bool) -> AppResult<()> {
    let db_type = if test_mode {
        DatabaseType::Test
    } else {
        DatabaseType::Production
    };

    let conn = get_db_connection(db_type)?;

    let now = get_current_timestamp();

    let id = domain.id.ok_or_else(|| crate::utils::error::AppError::Validation("Domain ID is required for update".to_string()))?;

    conn.execute(
        "UPDATE domains SET name = ?1, registrar = ?2, cost = ?3, currency = ?4, registration_date = ?5, expiry_date = ?6, auto_renew = ?7, status = ?8, notes = ?9, updated_at = ?10 WHERE id = ?11",
        rusqlite::params![
            domain.name,
            domain.registrar,
            domain.cost,
            domain.currency,
            domain.registration_date,
            domain.expiry_date,
            if domain.auto_renew { 1 } else { 0 },
            domain.status,
            domain.notes,
            now,
            id,
        ],
    )?;

    Ok(())
}

#[tauri::command]
pub fn delete_domain(id: i64, test_mode: bool) -> AppResult<()> {
    let db_type = if test_mode {
        DatabaseType::Test
    } else {
        DatabaseType::Production
    };

    let conn = get_db_connection(db_type)?;

    conn.execute("DELETE FROM domains WHERE id = ?1", [id])?;

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::db::{get_db_connection, DatabaseType, init_database, clear_test_database};

    fn setup_test_db() {
        let conn = get_db_connection(DatabaseType::Test).unwrap();
        init_database(&conn).unwrap();
        clear_test_database(&conn).unwrap();
    }

    #[test]
    fn test_create_and_get_domain() {
        setup_test_db();
        
        let domain = Domain {
            id: None,
            name: "example.com".to_string(),
            registrar: Some("Namecheap".to_string()),
            cost: Some(12.99),
            currency: Some("USD".to_string()),
            registration_date: Some("2023-01-01".to_string()),
            expiry_date: "2024-01-01".to_string(),
            auto_renew: true,
            status: "active".to_string(),
            notes: None,
            created_at: "".to_string(),
            updated_at: "".to_string(),
        };

        let id = create_domain(domain, true).unwrap();
        assert!(id > 0);

        let domains = get_domains(true).unwrap();
        assert_eq!(domains.len(), 1);
        assert_eq!(domains[0].name, "example.com");
    }

    #[test]
    fn test_update_domain() {
        setup_test_db();
        
        let domain = Domain {
            id: None,
            name: "original.com".to_string(),
            registrar: None,
            cost: None,
            currency: None,
            registration_date: None,
            expiry_date: "2024-01-01".to_string(),
            auto_renew: false,
            status: "active".to_string(),
            notes: None,
            created_at: "".to_string(),
            updated_at: "".to_string(),
        };

        let id = create_domain(domain.clone(), true).unwrap();
        
        let mut updated_domain = domain;
        updated_domain.id = Some(id);
        updated_domain.name = "updated.com".to_string();
        updated_domain.registrar = Some("GoDaddy".to_string());

        update_domain(updated_domain, true).unwrap();

        let fetched = get_domain_by_id(id, true).unwrap();
        assert_eq!(fetched.name, "updated.com");
        assert_eq!(fetched.registrar, Some("GoDaddy".to_string()));
    }
}
