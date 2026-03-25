"""initial_schema

Revision ID: 71470bcc111e
Revises: 
Create Date: 2026-03-25

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '71470bcc111e'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create users table
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('username', sa.String(100), unique=True, nullable=False, index=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
    )

    # Create read_history table
    op.create_table(
        'read_history',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('article_text', sa.Text(), nullable=True),
        sa.Column('political_leaning', sa.Float(), nullable=True, server_default='0.0'),
        sa.Column('emotional_manipulation', sa.Float(), nullable=True, server_default='0.0'),
        sa.Column('cognitive_bias', sa.Float(), nullable=True, server_default='0.0'),
        sa.Column('timestamp', sa.DateTime(), nullable=True),
    )

    # Create article_inventory table
    op.create_table(
        'article_inventory',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('title', sa.String(500), nullable=True, index=True),
        sa.Column('content', sa.Text(), nullable=True),
        sa.Column('url', sa.String(1000), nullable=True),
        sa.Column('political_leaning', sa.Float(), nullable=True, server_default='0.0'),
        sa.Column('emotional_manipulation', sa.Float(), nullable=True, server_default='0.0'),
        sa.Column('cognitive_bias', sa.Float(), nullable=True, server_default='0.0'),
    )


def downgrade() -> None:
    op.drop_table('article_inventory')
    op.drop_table('read_history')
    op.drop_table('users')
