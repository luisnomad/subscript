// Subscription command handlers

use crate::db::{get_db_connection, DatabaseType};
use crate::models::Subscription;
use crate::utils::get_current_timestamp;
use anyhow::Result;

#[tauri::command]
pub fn get_subscriptions(test_mode: bool) -> Result<Vec<Subscription>, String> {
    let db_type = if test_mode {
        DatabaseType::Test
    } else {
        DatabaseType::Production
    };

    let conn = get_db_connection(db_type).map_err(|e| e.to_string())?;

    let mut stmt = conn
        .prepare("SELECT id, name, amount, currency, periodicity, next_date, category, status, notes, created_at, updated_at FROM subscriptions ORDER BY created_at DESC")
        .map_err(|e| e.to_string())?;

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
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(subscriptions)
}

#[tauri::command]
pub fn get_subscription_by_id(id: i64, test_mode: bool) -> Result<Subscription, String> {
    let db_type = if test_mode {
        DatabaseType::Test
    } else {
        DatabaseType::Production
    };

    let conn = get_db_connection(db_type).map_err(|e| e.to_string())?;

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
        )
        .map_err(|e| e.to_string())?;

    Ok(subscription)
}

#[tauri::command]
pub fn create_subscription(subscription: Subscription, test_mode: bool) -> Result<i64, String> {
    let db_type = if test_mode {
        DatabaseType::Test
    } else {
        DatabaseType::Production
    };

    let conn = get_db_connection(db_type).map_err(|e| e.to_string())?;

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
    )
    .map_err(|e| e.to_string())?;

    Ok(conn.last_insert_rowid())
}

#[tauri::command]
pub fn update_subscription(subscription: Subscription, test_mode: bool) -> Result<(), String> {
    let db_type = if test_mode {
        DatabaseType::Test
    } else {
        DatabaseType::Production
    };

    let conn = get_db_connection(db_type).map_err(|e| e.to_string())?;

    let now = get_current_timestamp();

    let id = subscription.id.ok_or("Subscription ID is required for update")?;

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
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn delete_subscription(id: i64, test_mode: bool) -> Result<(), String> {
    let db_type = if test_mode {
        DatabaseType::Test
    } else {
        DatabaseType::Production
    };

    let conn = get_db_connection(db_type).map_err(|e| e.to_string())?;

    conn.execute("DELETE FROM subscriptions WHERE id = ?1", [id])
        .map_err(|e| e.to_string())?;

    Ok(())
}
