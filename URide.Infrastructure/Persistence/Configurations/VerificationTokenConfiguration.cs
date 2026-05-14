using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using URide.Domain.Entities;

namespace URide.Infrastructure.Persistence.Configurations;

public class VerificationTokenConfiguration : IEntityTypeConfiguration<VerificationToken>
{
    public void Configure(EntityTypeBuilder<VerificationToken> builder)
    {
        builder.ToTable("verification_tokens");

        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).HasColumnName("id").HasDefaultValueSql("gen_random_uuid()");

        builder.Property(x => x.UserId).HasColumnName("user_id").IsRequired();

        builder.Property(x => x.TokenHash).HasColumnName("token_hash").HasColumnType("TEXT").IsRequired();

        builder.Property(x => x.Type).HasColumnName("type").HasMaxLength(20).IsRequired();

        builder.Property(x => x.ExpiresAt).HasColumnName("expires_at").HasColumnType("TIMESTAMPTZ").IsRequired();

        builder.Property(x => x.UsedAt).HasColumnName("used_at").HasColumnType("TIMESTAMPTZ");

        // Relacion y ON DELETE CASCADE
        builder.HasOne(x => x.User)
               .WithMany(u => u.VerificationTokens)
               .HasForeignKey(x => x.UserId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}