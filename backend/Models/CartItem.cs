using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

public class CartItem
{
    public int Id { get; set; }

    [ForeignKey("Cart")]
    public int CartId { get; set; }

    [ForeignKey("Product")]
    public int ProductId { get; set; }

    [Required, Range(1, int.MaxValue)]
    public int Quantity { get; set; }

    public Cart Cart { get; set; } = null!;

    public Product Product { get; set; } = null!;
}