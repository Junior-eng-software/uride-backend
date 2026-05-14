using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using URide.Domain.Entities;

namespace URide.Infrastructure.Persistence.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("users");

        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).HasColumnName("id").HasDefaultValueSql("gen_random_uuid()");

        builder.Property(x => x.FullName).HasColumnName("full_name").HasMaxLength(120).IsRequired();

        builder.Property(x => x.Email).HasColumnName("email").HasMaxLength(255).IsRequired();
        builder.HasIndex(x => x.Email).IsUnique(); // Constraint UNIQUE de negocio

        builder.Property(x => x.Phone).HasColumnName("phone").HasMaxLength(20);

        builder.Property(x => x.PasswordHash).HasColumnName("password_hash").HasColumnType("TEXT").IsRequired();

        builder.Property(x => x.IsVerified).HasColumnName("is_verified").HasDefaultValue(false);

        builder.Property(x => x.CreatedAt).HasColumnName("created_at").HasColumnType("TIMESTAMPTZ").HasDefaultValueSql("NOW()");
        builder.Property(x => x.UpdatedAt).HasColumnName("updated_at").HasColumnType("TIMESTAMPTZ").HasDefaultValueSql("NOW()");
    }
}