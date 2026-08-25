"""Initial schema with User, Issue, Message models

Revision ID: 001
Revises: 
Create Date: 2024-01-01 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create users table
    op.create_table(
        'users',
        sa.Column('id', sa.String(36), nullable=False),
        sa.Column('email', sa.String(255), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('avatar_url', sa.String(2048), nullable=True),
        sa.Column('password_hash', sa.String(255), nullable=True),
        sa.Column('role', sa.Enum('ADMIN', 'USER', 'AGENT', name='userrole'), nullable=False, server_default='USER'),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email'),
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    
    # Create issues table
    op.create_table(
        'issues',
        sa.Column('id', sa.String(36), nullable=False),
        sa.Column('identifier', sa.String(50), nullable=False),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('status', sa.Enum('open', 'in_progress', 'closed', 'backlog', name='issuestatus'), nullable=False, server_default='open'),
        sa.Column('priority', sa.Enum('low', 'medium', 'high', 'critical', name='issuepriority'), nullable=False, server_default='medium'),
        sa.Column('assignee_id', sa.String(36), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(['assignee_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('identifier'),
    )
    op.create_index(op.f('ix_issues_assignee_id'), 'issues', ['assignee_id'])
    op.create_index(op.f('ix_issues_identifier'), 'issues', ['identifier'], unique=True)
    op.create_index(op.f('ix_issues_priority'), 'issues', ['priority'])
    op.create_index(op.f('ix_issues_status'), 'issues', ['status'])
    
    # Create messages table
    op.create_table(
        'messages',
        sa.Column('id', sa.String(36), nullable=False),
        sa.Column('channel_id', sa.String(36), nullable=False),
        sa.Column('author_id', sa.String(36), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('thread_id', sa.String(36), nullable=True),
        sa.Column('reactions', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(['author_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_messages_author_id'), 'messages', ['author_id'])
    op.create_index(op.f('ix_messages_channel_id'), 'messages', ['channel_id'])
    op.create_index(op.f('ix_messages_thread_id'), 'messages', ['thread_id'])


def downgrade() -> None:
    op.drop_index(op.f('ix_messages_thread_id'), table_name='messages')
    op.drop_index(op.f('ix_messages_channel_id'), table_name='messages')
    op.drop_index(op.f('ix_messages_author_id'), table_name='messages')
    op.drop_table('messages')
    op.drop_index(op.f('ix_issues_status'), table_name='issues')
    op.drop_index(op.f('ix_issues_priority'), table_name='issues')
    op.drop_index(op.f('ix_issues_identifier'), table_name='issues')
    op.drop_index(op.f('ix_issues_assignee_id'), table_name='issues')
    op.drop_table('issues')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_table('users')
