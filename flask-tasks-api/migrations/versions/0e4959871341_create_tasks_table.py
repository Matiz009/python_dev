"""create tasks table

Revision ID: 0e4959871341
Revises:
Create Date: 2026-08-10

Hand-tuned after autogeneration so the defaults are dialect-neutral:
``sa.false()`` and ``sa.func.now()`` render correctly on both SQLite and
PostgreSQL, whereas the generated SQLite literals would not.
"""

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "0e4959871341"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "tasks",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("done", sa.Boolean(), server_default=sa.false(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    with op.batch_alter_table("tasks", schema=None) as batch_op:
        batch_op.create_index(batch_op.f("ix_tasks_title"), ["title"], unique=False)


def downgrade():
    with op.batch_alter_table("tasks", schema=None) as batch_op:
        batch_op.drop_index(batch_op.f("ix_tasks_title"))

    op.drop_table("tasks")
