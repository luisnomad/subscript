// Subscription command handlers

use crate::db::{get_db_connection, DatabaseType};
use crate::models::Subscription;
use crate::utils::{get_current_timestamp, AppResult};

#[tauri::command]
pub fn get_subscriptions(test_mode: bool) -> AppResult<Vec<Subscription>> {
    let db_type = if test_mode {
        DatabaseType::Test
    } else {
        DatabaseType::Production
    };

    let conn = get_db_connection(db_type)?;

    let mut stmt = conn
        .prepare("SELECT id, name, amount, currency, periodicity, next_date, category, status, notes, created_at, updated_at FROM subscriptions ORDER BY created_at DESC")?;

    let subscriptions = stmt
        .query_map([], |row| {
            Ok(Subscription {
                id: Some(row.get(0)?),
                name: row.get(1)?,
                amount: row.get(2)?,
                currency: row.get(3)?,
                periodicity: row.get(4)?,
                next_date: row.get(5)?,
                category: row.get(6)?,
                status: row.get(7)?,
                notes: row.get(8)?,
                created_at: row.get(9)?,
                updated_at: row.get(10)?,
            })
        })?
        .collect::<Result<Vec<_>, _>>()?;

    Ok(subscriptions)
}

#[tauri::command]
pub fn get_subscription_by_id(id: i64, test_mode: bool) -> AppResult<Subscription> {
    let db_type = if test_mode {
        DatabaseType::Test
    } else {
        DatabaseType::Production
    };

    let conn = get_db_connection(db_type)?;

    let subscription = conn
        .query_row(
            "SELECT id, name, amount, currency, periodicity, next_date, category, status, notes, created_at, updated_at FROM subscriptions WHERE id = ?1",
            [id],
            |row| {
                Ok(Subscription {
                    id: Some(row.get(0)?),
                    name: row.get(1)?,
                    amount: row.get(2)?,
                    currency: row.get(3)?,
                    periodicity: row.get(4)?,
                    next_date: row.get(5)?,
                    category: row.get(6)?,
                    status: row.get(7)?,
                    notes: row.get(8)?,
                    created_at: row.get(9)?,
                    updated_at: row.get(10)?,
                })
            },
        )?;

    Ok(subscription)
}

#[tauri::command]
pub fn create_subscription(subscription: Subscription, test_mode: bool) -> AppResult<i64> {
    let db_type = if test_mode {
        DatabaseType::Test
    } else {
        DatabaseType::Production
    };

    let conn = get_db_connection(db_type)?;

    let now = get_current_timestamp();

    conn.execute(
        "INSERT INTO subscriptions (name, amount, currency, periodicity, next_date, category, status, notes, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
        rusqlite::params![
            subscription.name,
            subscription.amount,
            subscription.currency,
            subscription.periodicity,
            subscription.next_date,
            subscription.category,
            subscription.status,
            subscription.notes,
            now,
            now,
        ],
    )?;

    Ok(conn.last_insert_rowid())
}

#[tauri::command]
pub fn update_subscription(subscription: Subscription, test_mode: bool) -> AppResult<()> {
    let db_type = if test_mode {
        DatabaseType::Test
    } else {
        DatabaseType::Production
    };

    let conn = get_db_connection(db_type)?;

    let now = get_current_timestamp();

    let id = subscription.id.ok_or_else(|| crate::utils::error::AppError::Validation("Subscription ID is required for update".to_string()))?;

    conn.execute(
        "UPDATE subscriptions SET name = ?1, amount = ?2, currency = ?3, periodicity = ?4, next_date = ?5, category = ?6, status = ?7, notes = ?8, updated_at = ?9 WHERE id = ?10",
        rusqlite::params![
            subscription.name,
            subscription.amount,
            subscription.currency,
            subscription.periodicity,
            subscription.next_date,
            subscription.category,
            subscription.status,
            subscription.notes,
            now,
            id,
        ],
    )?;

    Ok(())
}

#[tauri::command]
pub fn delete_subscription(id: i64, test_mode: bool) -> AppResult<()> {
    let db_type = if test_mode {
        DatabaseType::Test
    } else {
        DatabaseType::Production
    };

    let conn = get_db_connection(db_type)?;

    conn.execute("DELETE FROM subscriptions WHERE id = ?1", [id])?;

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
    fn test_create_and_get_subscription() {
        setup_test_db();
        
        let sub = Subscription {
            id: None,
            name: "Test Sub".to_string(),
            amount: 9.99,
            currency: "USD".to_string(),
            periodicity: "monthly".to_string(),
            next_date: Some("2024-01-01".to_string()),
            category: Some("Entertainment".to_string()),
            status: "active".to_string(),
            notes: None,
            created_at: "".to_string(),
            updated_at: "".to_string(),
        };

        let id = create_subscription(sub, true).unwrap();
        assert!(id > 0);

        let subs = get_subscriptions(true).unwrap();
        assert_eq!(subs.len(), 1);
        assert_eq!(subs[0].name, "Test Sub");
        assert_eq!(subs[0].amount, 9.99);
    }

    #[test]
    fn test_update_subscription() {
        setup_test_db();
        
        let sub = Subscription {
            id: None,
            name: "Original Name".to_string(),
            amount: 10.0,
            currency: "USD".to_string(),
            periodicity: "monthly".to_string(),
            next_date: None,
            category: None,
            status: "active".to_string(),
            notes: None,
            created_at: "".to_string(),
            updated_at: "".to_string(),
        };

        let id = create_subscription(sub.clone(), true).unwrap();
        
        let mut updated_sub = sub;
        updated_sub.id = Some(id);
        updated_sub.name = "Updated Name".to_string();
        updated_sub.amount = 15.0;

        update_subscription(updated_sub, true).unwrap();

        let fetched = get_subscription_by_id(id, true).unwrap();
        assert_eq!(fetched.name, "Updated Name");
        assert_eq!(fetched.amount, 15.0);
    }

    #[test]
    fn test_delete_subscription() {
        setup_test_db();
        
        let sub = Subscription {
            id: None,
            name: "To Delete".to_string(),
            amount: 5.0,
            currency: "USD".to_string(),
            periodicity: "monthly".to_string(),
            next_date: None,
            category: None,
            status: "active".to_string(),
            notes: None,
            created_at: "".to_string(),
            updated_at: "".to_string(),
        };

        let id = create_subscription(sub, true).unwrap();
        delete_subscription(id, true).unwrap();

        let subs = get_subscriptions(true).unwrap();
        assert_eq!(subs.len(), 0);
    }
}
